using Microsoft.AspNetCore.Mvc;
using SmartBazaar.API.Services;
using Dapper;
using SmartBazaar.API.Data;

namespace SmartBazaar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VectorSearchController : ControllerBase
{
    private readonly VectorSearchService _vectorSearch;
    private readonly ProductService _productService;
    private readonly DatabaseContext _dbContext;
    private readonly SemanticSearchService _semanticSearch;

    public VectorSearchController(
        VectorSearchService vectorSearch, 
        ProductService productService,
        DatabaseContext dbContext,
        SemanticSearchService semanticSearch)
    {
        _vectorSearch = vectorSearch;
        _productService = productService;
        _dbContext = dbContext;
        _semanticSearch = semanticSearch;
    }

    /// <summary>
    /// Search products by text query using semantic search
    /// </summary>
    [HttpGet("text")]
    public async Task<IActionResult> SearchByText([FromQuery] string query, [FromQuery] int limit = 20)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest(new { error = "Query cannot be empty" });
        }

        try
        {
            var results = await _vectorSearch.SearchByTextAsync(query, limit);

            var products = new List<object>();
            foreach (var result in results)
            {
                var productId = (int)result.Id.Num;
                var score = result.Score;
                var metadata = result.Payload;

                products.Add(new
                {
                    id = productId,
                    score = score,
                    name = metadata.GetValueOrDefault("name")?.StringValue ?? "Unknown",
                    description = metadata.GetValueOrDefault("description")?.StringValue ?? "",
                    price = metadata.GetValueOrDefault("price")?.DoubleValue ?? 0,
                    category = metadata.GetValueOrDefault("category")?.StringValue ?? "",
                    image = metadata.GetValueOrDefault("image")?.StringValue ?? "",
                    storeId = metadata.GetValueOrDefault("storeId")?.IntegerValue ?? 0
                });
            }

            return Ok(new
            {
                success = true,
                query = query,
                totalResults = products.Count,
                results = products
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Text search error: {ex.Message}");
            return StatusCode(500, new { error = "Text search failed", message = ex.Message });
        }
    }

    /// <summary>
    /// Search products by uploading an image
    /// </summary>
    [HttpPost("image")]
    public async Task<IActionResult> SearchByImage(IFormFile image, [FromQuery] int limit = 20)
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest(new { error = "No image uploaded" });
        }

        try
        {
            using var stream = image.OpenReadStream();
            var results = await _vectorSearch.SearchByImageAsync(stream, limit);

            // If no results, return empty but successful response
            if (results == null || !results.Any())
            {
                return Ok(new
                {
                    success = true,
                    totalResults = 0,
                    results = new List<object>(),
                    message = "No similar products found. Try adding products to the database first."
                });
            }

            // Convert Qdrant results to product objects
            var products = new List<object>();
            foreach (var result in results)
            {
                var productId = (int)result.Id.Num;
                var score = result.Score;
                var metadata = result.Payload;

                products.Add(new
                {
                    id = productId,
                    score = score,
                    name = metadata.GetValueOrDefault("name")?.StringValue ?? "Unknown",
                    description = metadata.GetValueOrDefault("description")?.StringValue ?? "",
                    price = metadata.GetValueOrDefault("price")?.DoubleValue ?? 0,
                    category = metadata.GetValueOrDefault("category")?.StringValue ?? "",
                    image = metadata.GetValueOrDefault("image")?.StringValue ?? "",
                    storeId = metadata.GetValueOrDefault("storeId")?.IntegerValue ?? 0
                });
            }

            return Ok(new
            {
                success = true,
                totalResults = products.Count,
                results = products
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Image search error: {ex.Message}");
            Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
            
            // Return user-friendly error instead of 500
            return Ok(new 
            { 
                success = false, 
                error = "Image search is currently unavailable", 
                message = ex.Message,
                totalResults = 0,
                results = new List<object>()
            });
        }
    }

    /// <summary>
    /// Backfill: Index all existing products into vector database
    /// </summary>
    [HttpPost("backfill")]
    public async Task<IActionResult> BackfillProducts()
    {
        try
        {
            using var connection = _dbContext.CreateConnection();
            var products = await connection.QueryAsync<Models.Product>(
                "SELECT * FROM products ORDER BY productid"
            );

            var indexed = 0;
            var failed = 0;

            foreach (var product in products)
            {
                try
                {
                    var textToEmbed = $"{product.ProductName} {product.Description} {product.Category}";
                    var embedding = _vectorSearch.GetTextEmbedding(textToEmbed);
                    var metadata = new Dictionary<string, object>
                    {
                        ["name"] = product.ProductName ?? "",
                        ["description"] = product.Description ?? "",
                        ["price"] = product.Price,
                        ["category"] = product.Category ?? "",
                        ["image"] = product.ImageUrl ?? "",
                        ["storeId"] = product.StoreID,
                        ["stockQuantity"] = product.StockQuantity
                    };
                    await _semanticSearch.IndexProductAsync(product.ProductID, embedding, metadata);
                    indexed++;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Failed to index product {product.ProductID}: {ex.Message}");
                    failed++;
                }
            }

            return Ok(new
            {
                success = true,
                totalProducts = products.Count(),
                indexed = indexed,
                failed = failed,
                message = $"Backfill completed: {indexed} products indexed, {failed} failed"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Backfill error: {ex.Message}");
            return StatusCode(500, new { error = "Backfill failed", message = ex.Message });
        }
    }

    /// <summary>
    /// Get health status of vector search service
    /// </summary>
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "healthy",
            service = "VectorSearchService",
            clipModel = "loaded",
            textEmbedding = "enabled"
        });
    }
}
