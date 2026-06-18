using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using SmartBazaar.API.Models;
using SmartBazaar.API.Services;

namespace SmartBazaar.API.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class SellersController : ControllerBase
	{
		private readonly SellerService _sellerService;

		public SellersController(SellerService sellerService)
		{
			_sellerService = sellerService;
		}

		[HttpPost("register")]
		public async Task<IActionResult> Register([FromBody] OldRegisterRequest request)
		{
			try
			{
				var seller = new Models.Seller
				{
					FirstName = request.FirstName,
					LastName = request.LastName,
					Email = request.Email,
					Password = request.Password,
					PhoneNumber = request.PhoneNumber
				};

				if (await _sellerService.ExistsByEmailAsync(seller.Email))
					return BadRequest("Email already exists");

				var sellerId = await _sellerService.CreateAsync(seller);
				return CreatedAtAction(nameof(Register), new { sellerId = sellerId });
			}
			catch (Exception ex)
			{
				return BadRequest(ex.Message);
			}
		}

		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginRequest request)
		{
			try
			{
				var seller = await _sellerService.GetByEmailAsync(request.Email);
				if (seller == null || seller.Password != request.Password)
					return Unauthorized("Invalid credentials");

				return Ok(new { message = "Login successful", sellerId = seller.SellerID });
			}
			catch (Exception ex)
			{
				return Unauthorized(ex.Message);
			}
		}
	}

	public class OldRegisterRequest
	{
		public string FirstName { get; set; } = string.Empty;
		public string LastName { get; set; } = string.Empty;
		public string Email { get; set; } = string.Empty;
		public string Password { get; set; } = string.Empty;
		public string PhoneNumber { get; set; } = string.Empty;
	}
}