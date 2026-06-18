using System.ComponentModel.DataAnnotations;

namespace SmartBazaar.API.Models
{
	public class Product
	{
		public int ProductID { get; set; }

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

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
	}
}