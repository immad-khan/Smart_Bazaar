using System.ComponentModel.DataAnnotations;

namespace SmartBazaar.API.Models
{
	public class LoginRequest
	{
		[Required]
		public string Email { get; set; } = string.Empty;

		[Required]
		public string Password { get; set; } = string.Empty;
	}

	public class RegisterRequest
	{
		[Required]
		public string FirstName { get; set; } = string.Empty;

		[Required]
		public string LastName { get; set; } = string.Empty;

		[Required]
		[EmailAddress]
		public string Email { get; set; } = string.Empty;

		[Required]
		public string Password { get; set; } = string.Empty;

		[Phone]
		public string? PhoneNumber { get; set; }
	}

	public class AddStoreRequest
	{
		[Required]
		public int SellerID { get; set; }

		[Required]
		[StringLength(100)]
		public string StoreName { get; set; } = string.Empty;

		[Required]
		[StringLength(255)]
		public string Address { get; set; } = string.Empty;

		[Required]
		[StringLength(20)]
		public string ContactNumber { get; set; } = string.Empty;

		public string? Description { get; set; }
	}

	public class AddProductRequest
	{
		[Required]
		public int StoreID { get; set; }

		[Required]
		[StringLength(100)]
		public string ProductName { get; set; } = string.Empty;

		public string? Description { get; set; }

		[Required]
		[Range(0.01, 1000000)]
		public decimal Price { get; set; }

		[Required]
		[Range(0, int.MaxValue)]
		public int StockQuantity { get; set; }

		[Required]
		[StringLength(50)]
		public string Category { get; set; } = string.Empty;

		public string? ImageUrl { get; set; }
	}
}