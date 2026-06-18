using System.ComponentModel.DataAnnotations;

namespace SmartBazaar.API.Models
{
	public class Store
	{
		public int StoreID { get; set; }

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
	public double? Latitude { get; set; }
	public double? Longitude { get; set; }
	public string? GoogleMapsUrl { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
	}
}