using Microsoft.AspNetCore.Mvc;
using SmartBazaar.API.Services; // This brings in the ScraperService
using SmartBazaar.API.Models;   // This brings in ScrapedProduct
namespace SmartBazaar.API.Controllers; // Fixed: Controllers go here
[ApiController]
[Route("api/[controller]")]
public class ScraperController : ControllerBase
{
    private readonly ScraperService _scraper;
    public ScraperController(ScraperService scraper)
    {
        _scraper = scraper;
    }
    [HttpGet("test-naheed")]
    public async Task<IActionResult> TestNaheed(string keyword)
    {
        var result = await _scraper.SearchNaheed(keyword);  
        return Ok(result);
    }

    [HttpGet("search")]
public async Task<IActionResult> GetSearch(string q)
{
    if (string.IsNullOrWhiteSpace(q)) return BadRequest();
    
    // This now calls BOTH stores in parallel!
    var results = await _scraper.SearchAll(q);
    
    return Ok(results);
}
}