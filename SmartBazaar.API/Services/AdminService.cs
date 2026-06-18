using Dapper;
using SmartBazaar.API.Data;
using SmartBazaar.API.Models;

namespace SmartBazaar.API.Services
{
	public interface IAdminService
	{
		Task<List<SellerApprovalRequestDto>> GetPendingApprovalsAsync();
		Task<(bool success, string message)> ApproveSellerAsync(int requestId, int adminUserId);
		Task<(bool success, string message)> RejectSellerAsync(int requestId, int adminUserId, string reason);
		Task<List<User>> GetAllSellersAsync();
	}

	public class AdminService : IAdminService
	{
		private readonly DatabaseContext _dbContext;
		private readonly IEmailService _emailService;
		private readonly ILogger<AdminService> _logger;

		public AdminService(DatabaseContext dbContext, IEmailService emailService, ILogger<AdminService> logger)
		{
			_dbContext = dbContext;
			_emailService = emailService;
			_logger = logger;
		}

		public async Task<List<SellerApprovalRequestDto>> GetPendingApprovalsAsync()
		{
			using var connection = _dbContext.CreateConnection();

			var approvals = await connection.QueryAsync<SellerApprovalRequestDto>(
				@"SELECT 
					sar.id, sar.userid, sar.businessname, sar.businessaddress, 
					sar.businessphone, sar.taxid, sar.status, sar.requestedat,
					u.email, u.fullname, u.phonenumber
				  FROM sellerapprovalrequests sar
				  JOIN users u ON sar.userid = u.id
				  WHERE sar.status = 'Pending'
				  ORDER BY sar.requestedat DESC");

			return approvals.ToList();
		}

		public async Task<(bool success, string message)> ApproveSellerAsync(int requestId, int adminUserId)
		{
			using var connection = _dbContext.CreateConnection();

			var request = await connection.QueryFirstOrDefaultAsync<SellerApprovalRequest>(
				"SELECT * FROM sellerapprovalrequests WHERE id = @Id", new { Id = requestId });

			if (request == null)
			{
				return (false, "Approval request not found");
			}

			if (request.Status != "Pending")
			{
				return (false, "Request has already been reviewed");
			}

			// Update approval request
			await connection.ExecuteAsync(
				@"UPDATE sellerapprovalrequests 
				  SET status = 'Approved', reviewedat = @ReviewedAt, reviewedby = @ReviewedBy 
				  WHERE id = @Id",
				new { ReviewedAt = DateTime.UtcNow, ReviewedBy = adminUserId, Id = requestId });

			// Update user approval status
			await connection.ExecuteAsync(
				"UPDATE users SET isapprovedbyadmin = true, approvedat = @ApprovedAt WHERE id = @UserId",
				new { ApprovedAt = DateTime.UtcNow, UserId = request.UserId });

			// Get user details
			var user = await connection.QueryFirstOrDefaultAsync<User>(
				"SELECT * FROM users WHERE id = @UserId", new { UserId = request.UserId });

			// Send approval email
			if (user != null)
			{
				await _emailService.SendApprovalNotificationAsync(user.Email, user.FullName);
			}

			return (true, "Seller approved successfully");
		}

		public async Task<(bool success, string message)> RejectSellerAsync(int requestId, int adminUserId, string reason)
		{
			using var connection = _dbContext.CreateConnection();

			var request = await connection.QueryFirstOrDefaultAsync<SellerApprovalRequest>(
				"SELECT * FROM sellerapprovalrequests WHERE id = @Id", new { Id = requestId });

			if (request == null)
			{
				return (false, "Approval request not found");
			}

			if (request.Status != "Pending")
			{
				return (false, "Request has already been reviewed");
			}

			// Update approval request
			await connection.ExecuteAsync(
				@"UPDATE sellerapprovalrequests 
				  SET status = 'Rejected', rejectionreason = @RejectionReason, reviewedat = @ReviewedAt, reviewedby = @ReviewedBy 
				  WHERE id = @Id",
				new { RejectionReason = reason, ReviewedAt = DateTime.UtcNow, ReviewedBy = adminUserId, Id = requestId });

			// Get user details
			var user = await connection.QueryFirstOrDefaultAsync<User>(
				"SELECT * FROM users WHERE id = @UserId", new { UserId = request.UserId });

			// Send rejection email
			if (user != null)
			{
				await _emailService.SendRejectionNotificationAsync(user.Email, user.FullName, reason);
			}

			return (true, "Seller rejected successfully");
		}

		public async Task<List<User>> GetAllSellersAsync()
		{
			using var connection = _dbContext.CreateConnection();

			var sellers = await connection.QueryAsync<User>(
				@"SELECT * FROM users WHERE role = 'Seller' ORDER BY createdat DESC");

			return sellers.ToList();
		}
	}

	public class SellerApprovalRequestDto
	{
		public int Id { get; set; }
		public int UserId { get; set; }
		public string BusinessName { get; set; } = string.Empty;
		public string BusinessAddress { get; set; } = string.Empty;
		public string? BusinessPhone { get; set; }
		public string? TaxId { get; set; }
		public string Status { get; set; } = string.Empty;
		public DateTime RequestedAt { get; set; }
		public string Email { get; set; } = string.Empty;
		public string FullName { get; set; } = string.Empty;
		public string? PhoneNumber { get; set; }
	}
}
