using Microsoft.AspNetCore.Mvc;
using SmartBazaar.API.Services;
using Dapper;
using Npgsql;
using System.Data;

namespace SmartBazaar.API.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class SearchController : ControllerBase
	{
		private readonly ScraperService _scraperService;
		private readonly string _connectionString;

		public SearchController(ScraperService scraperService, IConfiguration configuration)
		{
			_scraperService = scraperService;
			_connectionString = configuration.GetConnectionString("DefaultConnection")
				?? throw new InvalidOperationException("Database connection string not configured.");
		}

		private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

		// GET: api/search?q=milk
		[HttpGet]
		public async Task<IActionResult> UnifiedSearch([FromQuery] string q)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(q))
				{
					return BadRequest("Search query cannot be empty.");
				}

				// Search in parallel from both sources
			var scrapedTask = _scraperService.SearchAll(q);
			var databaseTask = SearchDatabaseProducts(q);

			List<dynamic> databaseResults = new List<dynamic>();
			try 
			{
				await databaseTask;
				databaseResults = databaseTask.Result;
			}
			catch (Exception dbEx) 
			{
				Console.WriteLine($"Database search failed: {dbEx.Message}");
			}

			await scrapedTask;

			var result = new
			{
				query = q,
				scraped = scrapedTask.Result,
				database = databaseResults,
				totalResults = scrapedTask.Result.Count + databaseResults.Count
			};

			return Ok(result);
			}
			catch (Exception ex)
			{
				return BadRequest(ex.Message);
			}
		}

		private async Task<List<dynamic>> SearchDatabaseProducts(string query)
		{
			using (var connection = CreateConnection())
			{
				var sql = @"
					SELECT 
						p.productid,
						p.productname as name,
						p.description,
						p.price,
						p.stockquantity as stock,
						p.category,
						p.imageurl as image,
						s.storename as store,
						s.address,
						s.contactnumber as contact,
						s.latitude,
						s.longitude,
						s.googlemapsurl,
						'database' as source
					FROM products p
					INNER JOIN stores s ON p.storeid = s.storeid
					WHERE LOWER(p.productname) LIKE LOWER(@SearchTerm) 
					   OR LOWER(p.description) LIKE LOWER(@SearchTerm)
					   OR LOWER(p.category) LIKE LOWER(@SearchTerm)
					ORDER BY p.createdat DESC
					LIMIT 50";

				var products = await connection.QueryAsync<dynamic>(
					sql,
					new { SearchTerm = $"%{query}%" }
				);

				return products.ToList();
			}
		}
	}
}
