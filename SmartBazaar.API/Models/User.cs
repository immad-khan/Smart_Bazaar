using System.ComponentModel.DataAnnotations.Schema;

namespace SmartBazaar.API.Models
{
	[Table("users")]
	public class User
	{
		[Column("id")]
		public int Id { get; set; }
		
		[Column("email")]
		public string Email { get; set; } = string.Empty;
		
		[Column("passwordhash")]
		public string PasswordHash { get; set; } = string.Empty;
		
		[Column("fullname")]
		public string FullName { get; set; } = string.Empty;
		
		[Column("phonenumber")]
		public string? PhoneNumber { get; set; }
		
		[Column("role")]
		public string Role { get; set; } = "Seller"; // Seller, Admin
		
		[Column("isemailverified")]
		public bool IsEmailVerified { get; set; } = false;
		
		[Column("isapprovedbyadmin")]
		public bool IsApprovedByAdmin { get; set; } = false;
		
		[Column("createdat")]
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		
		[Column("approvedat")]
		public DateTime? ApprovedAt { get; set; }
	}

	[Table("emailverifications")]
	public class EmailVerification
	{
		[Column("id")]
		public int Id { get; set; }
		
		[Column("userid")]
		public int UserId { get; set; }
		
		[Column("email")]
		public string Email { get; set; } = string.Empty;
		
		[Column("confirmationcode")]
		public string ConfirmationCode { get; set; } = string.Empty;
		
		[Column("expiresat")]
		public DateTime ExpiresAt { get; set; }
		
		[Column("isused")]
		public bool IsUsed { get; set; } = false;
		
		[Column("createdat")]
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}

	[Table("sellerapprovalrequests")]
	public class SellerApprovalRequest
	{
		[Column("id")]
		public int Id { get; set; }
		
		[Column("userid")]
		public int UserId { get; set; }
		
		[Column("businessname")]
		public string BusinessName { get; set; } = string.Empty;
		
		[Column("businessaddress")]
		public string BusinessAddress { get; set; } = string.Empty;
		
		[Column("businessphone")]
		public string? BusinessPhone { get; set; }
		
		[Column("taxid")]
		public string? TaxId { get; set; }
		
		[Column("status")]
		public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
		
		[Column("rejectionreason")]
		public string? RejectionReason { get; set; }
		
		[Column("requestedat")]
		public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
		
		[Column("reviewedat")]
		public DateTime? ReviewedAt { get; set; }
		
		[Column("reviewedby")]
		public int? ReviewedBy { get; set; }
	}
}
