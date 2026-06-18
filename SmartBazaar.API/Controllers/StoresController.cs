using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using SmartBazaar.API.Models;
using SmartBazaar.API.Services;

namespace SmartBazaar.API.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class StoresController : ControllerBase
	{
		private readonly StoreService _storeService;

		public StoresController(StoreService storeService)
		{
			_storeService = storeService;
		}

		[HttpPost]
		public async Task<IActionResult> Create([FromBody] AddStoreRequest request)
		{
			try
			{
				var store = new Models.Store
				{
					SellerID = request.SellerID,
					StoreName = request.StoreName,
					Address = request.Address,
					ContactNumber = request.ContactNumber,
					Description = request.Description
				};

				if (await _storeService.ExistsByNameAsync(store.StoreName, store.SellerID))
					return BadRequest("Store name already exists");

				var storeId = await _storeService.CreateAsync(store);
				return CreatedAtAction(nameof(Create), new { storeId = storeId });
			}
			catch (Exception ex)
			{
				return BadRequest(ex.Message);
			}
		}

		[HttpGet]
		public async Task<IActionResult> GetBySellerId([FromQuery] int sellerId)
		{
			try
			{
				var store = await _storeService.GetBySellerIdAsync(sellerId);
				if (store == null)
					return NotFound();

				return Ok(store);
			}
			catch (Exception ex)
			{
				return BadRequest(ex.Message);
			}
		}

		[HttpGet("all")]
		public async Task<IActionResult> GetAllStores()
		{
			try
			{
				var stores = await _storeService.GetAllStoresAsync();
				return Ok(stores);
			}
			catch (Exception ex)
			{
				return BadRequest(ex.Message);
			}
		}
	}
}