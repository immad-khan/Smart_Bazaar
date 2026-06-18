using Microsoft.AspNetCore.Mvc;
using SmartBazaar.API.Services;
using SmartBazaar.API.Models;

namespace SmartBazaar.API.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class AuthController : ControllerBase
	{
		private readonly IAuthService _authService;
		private readonly ILogger<AuthController> _logger;

		public AuthController(IAuthService authService, ILogger<AuthController> logger)
		{
			_authService = authService;
			_logger = logger;
		}

		[HttpPost("register")]
		public async Task<IActionResult> Register([FromBody] RegisterRequest request)
		{
			try
			{
				var (success, message, userId) = await _authService.RegisterUserAsync(
					request.Email, request.Password, request.FullName, request.PhoneNumber);

				if (!success)
				{
					return BadRequest(new { message });
				}

				return Ok(new { message, userId });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error during registration");
				return StatusCode(500, new { message = "An error occurred during registration" });
			}
		}

		[HttpPost("verify-email")]
		public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
		{
			try
			{
				var (success, message) = await _authService.VerifyEmailAsync(request.Email, request.Code);

				if (!success)
				{
					return BadRequest(new { message });
				}

				return Ok(new { message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error during email verification");
				return StatusCode(500, new { message = "An error occurred during email verification" });
			}
		}

		[HttpPost("resend-code")]
		public async Task<IActionResult> ResendCode([FromBody] ResendCodeRequest request)
		{
			try
			{
				var (success, message) = await _authService.ResendConfirmationCodeAsync(request.Email);

				if (!success)
				{
					return BadRequest(new { message });
				}

				return Ok(new { message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error resending confirmation code");
				return StatusCode(500, new { message = "An error occurred while resending code" });
			}
		}

		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginRequest request)
		{
			try
			{
				_logger.LogInformation("Login attempt for email: {Email}", request?.Email ?? "NULL");
				
				if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
				{
					_logger.LogWarning("Login request is null or missing email/password");
					return BadRequest(new { message = "Email and password are required" });
				}

				var (success, message, token, user) = await _authService.LoginAsync(request.Email, request.Password);

				if (!success || user == null)
				{
					_logger.LogWarning("Login failed for {Email}: {Message}", request.Email, message);
					return BadRequest(new { message });
				}

				_logger.LogInformation("Login successful for {Email}", request.Email);
				return Ok(new { message, token, user = new { user.Id, user.Email, user.FullName, user.Role, user.IsApprovedByAdmin } });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error during login");
				return StatusCode(500, new { message = "An error occurred during login" });
			}
		}

		[HttpPost("request-approval")]
		public async Task<IActionResult> RequestApproval([FromBody] SellerApprovalRequestModel request)
		{
			try
			{
				var (success, message) = await _authService.RequestSellerApprovalAsync(
					request.UserId, request.BusinessName, request.BusinessAddress, 
					request.BusinessPhone, request.TaxId);

				if (!success)
				{
					return BadRequest(new { message });
				}

				return Ok(new { message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error requesting seller approval");
				return StatusCode(500, new { message = "An error occurred while requesting approval" });
			}
		}
	}

	public class RegisterRequest
	{
		[System.Text.Json.Serialization.JsonPropertyName("email")]
		public string Email { get; set; } = string.Empty;
		
		[System.Text.Json.Serialization.JsonPropertyName("password")]
		public string Password { get; set; } = string.Empty;
		
		[System.Text.Json.Serialization.JsonPropertyName("fullName")]
		public string FullName { get; set; } = string.Empty;
		
		[System.Text.Json.Serialization.JsonPropertyName("phoneNumber")]
		public string? PhoneNumber { get; set; }
	}

	public class VerifyEmailRequest
	{
		[System.Text.Json.Serialization.JsonPropertyName("email")]
		public string Email { get; set; } = string.Empty;
		
		[System.Text.Json.Serialization.JsonPropertyName("code")]
		public string Code { get; set; } = string.Empty;
	}

	public class ResendCodeRequest
	{
		[System.Text.Json.Serialization.JsonPropertyName("email")]
		public string Email { get; set; } = string.Empty;
	}

	public class LoginRequest
	{
		[System.Text.Json.Serialization.JsonPropertyName("email")]
		public string Email { get; set; } = string.Empty;
		
		[System.Text.Json.Serialization.JsonPropertyName("password")]
		public string Password { get; set; } = string.Empty;
	}

	public class SellerApprovalRequestModel
	{
		public int UserId { get; set; }
		public string BusinessName { get; set; } = string.Empty;
		public string BusinessAddress { get; set; } = string.Empty;
		public string? BusinessPhone { get; set; }
		public string? TaxId { get; set; }
	}
}
