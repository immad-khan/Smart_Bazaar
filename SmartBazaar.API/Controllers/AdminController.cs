using Microsoft.AspNetCore.Mvc;
using SmartBazaar.API.Services;

namespace SmartBazaar.API.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class AdminController : ControllerBase
	{
		private readonly IAdminService _adminService;
		private readonly ILogger<AdminController> _logger;

		public AdminController(IAdminService adminService, ILogger<AdminController> logger)
		{
			_adminService = adminService;
			_logger = logger;
		}

		[HttpGet("pending-approvals")]
		public async Task<IActionResult> GetPendingApprovals()
		{
			try
			{
				var approvals = await _adminService.GetPendingApprovalsAsync();
				return Ok(approvals);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting pending approvals");
				return StatusCode(500, new { message = "An error occurred while fetching pending approvals" });
			}
		}

		[HttpPost("approve/{requestId}")]
		public async Task<IActionResult> ApproveSeller(int requestId, [FromBody] AdminActionRequest request)
		{
			try
			{
				var (success, message) = await _adminService.ApproveSellerAsync(requestId, request.AdminUserId);

				if (!success)
				{
					return BadRequest(new { message });
				}

				return Ok(new { message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error approving seller");
				return StatusCode(500, new { message = "An error occurred while approving seller" });
			}
		}

		[HttpPost("reject/{requestId}")]
		public async Task<IActionResult> RejectSeller(int requestId, [FromBody] RejectSellerRequest request)
		{
			try
			{
				var (success, message) = await _adminService.RejectSellerAsync(requestId, request.AdminUserId, request.Reason);

				if (!success)
				{
					return BadRequest(new { message });
				}

				return Ok(new { message });
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error rejecting seller");
				return StatusCode(500, new { message = "An error occurred while rejecting seller" });
			}
		}

		[HttpGet("sellers")]
		public async Task<IActionResult> GetAllSellers()
		{
			try
			{
				var sellers = await _adminService.GetAllSellersAsync();
				return Ok(sellers);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting all sellers");
				return StatusCode(500, new { message = "An error occurred while fetching sellers" });
			}
		}
	}

	public class AdminActionRequest
	{
		public int AdminUserId { get; set; }
	}

	public class RejectSellerRequest
	{
		public int AdminUserId { get; set; }
		public string Reason { get; set; } = string.Empty;
	}
}
