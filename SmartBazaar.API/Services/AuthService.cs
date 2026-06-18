using Dapper;
using SmartBazaar.API.Data;
using SmartBazaar.API.Models;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SmartBazaar.API.Services
{
	public interface IAuthService
	{
		Task<(bool success, string message, int userId)> RegisterUserAsync(string email, string password, string fullName, string? phoneNumber);
		Task<(bool success, string message)> VerifyEmailAsync(string email, string code);
		Task<(bool success, string message)> ResendConfirmationCodeAsync(string email);
		Task<(bool success, string message, string? token, User? user)> LoginAsync(string email, string password);
		Task<(bool success, string message)> RequestSellerApprovalAsync(int userId, string businessName, string businessAddress, string? businessPhone, string? taxId);
	}

	public class AuthService : IAuthService
	{
		private readonly DatabaseContext _dbContext;
		private readonly IEmailService _emailService;
		private readonly IConfiguration _configuration;
		private readonly ILogger<AuthService> _logger;

		public AuthService(DatabaseContext dbContext, IEmailService emailService, IConfiguration configuration, ILogger<AuthService> logger)
		{
			_dbContext = dbContext;
			_emailService = emailService;
			_configuration = configuration;
			_logger = logger;
		}

		public async Task<(bool success, string message, int userId)> RegisterUserAsync(string email, string password, string fullName, string? phoneNumber)
		{
			using var connection = _dbContext.CreateConnection();

			// Check if email already exists
			var existingUser = await connection.QueryFirstOrDefaultAsync<User>(
				"SELECT * FROM users WHERE email = @Email", new { Email = email });

			if (existingUser != null)
			{
				return (false, "Email already registered", 0);
			}

			// Hash password
			var passwordHash = HashPassword(password);

			// Create user
			var userId = await connection.QuerySingleAsync<int>(
				@"INSERT INTO users (email, passwordhash, fullname, phonenumber, role, isemailverified, isapprovedbyadmin, createdat) 
				  VALUES (@Email, @PasswordHash, @FullName, @PhoneNumber, 'Seller', false, false, @CreatedAt) 
				  RETURNING id",
				new { Email = email, PasswordHash = passwordHash, FullName = fullName, PhoneNumber = phoneNumber, CreatedAt = DateTime.UtcNow });

			// Generate and send confirmation code
			var code = GenerateConfirmationCode();
			await connection.ExecuteAsync(
				@"INSERT INTO emailverifications (userid, email, confirmationcode, expiresat, isused, createdat) 
				  VALUES (@UserId, @Email, @ConfirmationCode, @ExpiresAt, false, @CreatedAt)",
				new { UserId = userId, Email = email, ConfirmationCode = code, ExpiresAt = DateTime.UtcNow.AddMinutes(15), CreatedAt = DateTime.UtcNow });

			await _emailService.SendConfirmationCodeAsync(email, code);

			return (true, "Registration successful. Please check your email for confirmation code.", userId);
		}

		public async Task<(bool success, string message)> VerifyEmailAsync(string email, string code)
		{
			using var connection = _dbContext.CreateConnection();

			var verification = await connection.QueryFirstOrDefaultAsync<EmailVerification>(
				@"SELECT * FROM emailverifications 
				  WHERE email = @Email AND confirmationcode = @Code AND isused = false AND expiresat > @Now 
				  ORDER BY createdat DESC LIMIT 1",
				new { Email = email, Code = code, Now = DateTime.UtcNow });

			if (verification == null)
			{
				return (false, "Invalid or expired confirmation code");
			}

			// Mark verification as used
			await connection.ExecuteAsync(
				"UPDATE emailverifications SET isused = true WHERE id = @Id",
				new { Id = verification.Id });

			// Update user email verification status
			await connection.ExecuteAsync(
				"UPDATE users SET isemailverified = true WHERE email = @Email",
				new { Email = email });

			return (true, "Email verified successfully. Your account is now pending admin approval.");
		}

		public async Task<(bool success, string message)> ResendConfirmationCodeAsync(string email)
		{
			using var connection = _dbContext.CreateConnection();

			var user = await connection.QueryFirstOrDefaultAsync<User>(
				"SELECT * FROM users WHERE email = @Email", new { Email = email });

			if (user == null)
			{
				return (false, "Email not found");
			}

			if (user.IsEmailVerified)
			{
				return (false, "Email already verified");
			}

			// Mark old codes as used
			await connection.ExecuteAsync(
				"UPDATE emailverifications SET isused = true WHERE email = @Email",
				new { Email = email });

			// Generate new code
			var code = GenerateConfirmationCode();
			await connection.ExecuteAsync(
				@"INSERT INTO emailverifications (userid, email, confirmationcode, expiresat, isused, createdat) 
				  VALUES (@UserId, @Email, @ConfirmationCode, @ExpiresAt, false, @CreatedAt)",
				new { UserId = user.Id, Email = email, ConfirmationCode = code, ExpiresAt = DateTime.UtcNow.AddMinutes(15), CreatedAt = DateTime.UtcNow });

			await _emailService.SendConfirmationCodeAsync(email, code);

			return (true, "Confirmation code resent successfully");
		}

		public async Task<(bool success, string message, string? token, User? user)> LoginAsync(string email, string password)
		{
			using var connection = _dbContext.CreateConnection();

			_logger.LogInformation("Attempting to query user with email: {Email}", email);

			var user = await connection.QueryFirstOrDefaultAsync<User>(
				"SELECT * FROM users WHERE email = @Email", new { Email = email });

			_logger.LogInformation("Query result from users table: User found = {UserFound}, Email = {UserEmail}", 
				user != null, user?.Email ?? "NULL");

			// If not found in users table, check sellers table
			if (user == null)
			{
				_logger.LogInformation("User not found in users table, checking sellers table");
				
				var seller = await connection.QueryFirstOrDefaultAsync<Seller>(
					"SELECT * FROM sellers WHERE Email = @Email", new { Email = email });

				if (seller != null)
				{
					_logger.LogInformation("Seller found in sellers table: {Email}", seller.Email);
					
					// Check password (sellers table uses plain text Password column)
					if (seller.Password != password)
					{
						_logger.LogWarning("Login failed - Invalid password for seller");
						return (false, "Invalid email or password", null, null);
					}

					// Convert Seller to User object for consistent return type
					user = new User
					{
						Id = seller.SellerID,
						Email = seller.Email,
						FullName = $"{seller.FirstName} {seller.LastName}",
						PhoneNumber = seller.PhoneNumber,
						Role = "Seller",
						IsEmailVerified = true, // Assume sellers are verified
						IsApprovedByAdmin = true, // Assume sellers are approved
						CreatedAt = seller.CreatedAt
					};

					_logger.LogInformation("Seller converted to user object successfully");
				}
			}

			if (user != null)
			{
				_logger.LogInformation("User properties - IsEmailVerified: {IsEmailVerified}, IsApprovedByAdmin: {IsApprovedByAdmin}, PasswordHash length: {HashLength}", 
					user.IsEmailVerified, user.IsApprovedByAdmin, user.PasswordHash?.Length ?? 0);
			}

			if (user == null)
			{
				_logger.LogWarning("Login failed - User not found in either table");
				return (false, "Invalid email or password", null, null);
			}

			// For users from users table, verify hashed password
			if (!string.IsNullOrEmpty(user.PasswordHash) && !VerifyPassword(password, user.PasswordHash))
			{
				_logger.LogWarning("Login failed - Invalid password for user");
				return (false, "Invalid email or password", null, null);
			}

			if (!user.IsEmailVerified)
			{
				_logger.LogWarning("Login failed - Email not verified for {Email}", email);
				return (false, "Please verify your email first", null, null);
			}

			if (!user.IsApprovedByAdmin && user.Role == "Seller")
			{
				// Check if approval request exists
				var approvalRequest = await connection.QueryFirstOrDefaultAsync<SellerApprovalRequest>(
					"SELECT * FROM sellerapprovalrequests WHERE userid = @UserId ORDER BY requestedat DESC LIMIT 1",
					new { UserId = user.Id });

				if (approvalRequest == null)
				{
					return (false, "Please complete your seller profile for admin approval", null, null);
				}

				if (approvalRequest.Status == "Pending")
				{
					return (false, "Your account is pending admin approval", null, null);
				}

				if (approvalRequest.Status == "Rejected")
				{
					return (false, $"Your account was rejected. Reason: {approvalRequest.RejectionReason}", null, null);
				}
			}

			// Generate JWT token
			var token = GenerateJwtToken(user);

			return (true, "Login successful", token, user);
		}

		public async Task<(bool success, string message)> RequestSellerApprovalAsync(int userId, string businessName, string businessAddress, string? businessPhone, string? taxId)
		{
			using var connection = _dbContext.CreateConnection();

			var user = await connection.QueryFirstOrDefaultAsync<User>(
				"SELECT * FROM users WHERE id = @UserId", new { UserId = userId });

			if (user == null)
			{
				return (false, "User not found");
			}

			if (!user.IsEmailVerified)
			{
				return (false, "Please verify your email first");
			}

			// Check if already approved
			if (user.IsApprovedByAdmin)
			{
				return (false, "Your account is already approved");
			}

			// Check for existing pending request
			var existingRequest = await connection.QueryFirstOrDefaultAsync<SellerApprovalRequest>(
				@"SELECT * FROM sellerapprovalrequests 
				  WHERE userid = @UserId AND status = 'Pending' 
				  ORDER BY requestedat DESC LIMIT 1",
				new { UserId = userId });

			if (existingRequest != null)
			{
				return (false, "You already have a pending approval request");
			}

			// Create approval request
			await connection.ExecuteAsync(
				@"INSERT INTO sellerapprovalrequests (userid, businessname, businessaddress, businessphone, taxid, status, requestedat) 
				  VALUES (@UserId, @BusinessName, @BusinessAddress, @BusinessPhone, @TaxId, 'Pending', @RequestedAt)",
				new { UserId = userId, BusinessName = businessName, BusinessAddress = businessAddress, BusinessPhone = businessPhone, TaxId = taxId, RequestedAt = DateTime.UtcNow });

			return (true, "Approval request submitted successfully. Please wait for admin review.");
		}

		private string HashPassword(string password)
		{
			using var sha256 = SHA256.Create();
			var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
			return Convert.ToBase64String(hashedBytes);
		}

		private bool VerifyPassword(string password, string passwordHash)
		{
			return HashPassword(password) == passwordHash;
		}

		private string GenerateConfirmationCode()
		{
			return Random.Shared.Next(100000, 999999).ToString();
		}

		private string GenerateJwtToken(User user)
		{
			var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));
			var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

			var claims = new[]
			{
				new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
				new Claim(ClaimTypes.Email, user.Email),
				new Claim(ClaimTypes.Name, user.FullName),
				new Claim(ClaimTypes.Role, user.Role)
			};

			var token = new JwtSecurityToken(
				issuer: _configuration["Jwt:Issuer"],
				audience: _configuration["Jwt:Audience"],
				claims: claims,
				expires: DateTime.Now.AddMinutes(int.Parse(_configuration["Jwt:ExpiryInMinutes"]!)),
				signingCredentials: credentials
			);

			return new JwtSecurityTokenHandler().WriteToken(token);
		}
	}
}
