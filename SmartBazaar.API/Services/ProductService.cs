using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using SmartBazaar.API.Data;

namespace SmartBazaar.API.Services
{
	public class ProductService
	{
		private readonly DatabaseContext _context;
		private readonly VectorSearchService _vectorSearch;
		private readonly SemanticSearchService _semanticSearch;

		public ProductService(DatabaseContext context, VectorSearchService vectorSearch, SemanticSearchService semanticSearch)
		{
			_context = context;
			_vectorSearch = vectorSearch;
			_semanticSearch = semanticSearch;
		}

		public async Task<List<Models.Product>> GetByStoreIdAsync(int storeId)
		{
			using var connection = _context.CreateConnection();
			var sql = "SELECT * FROM products WHERE storeid = @StoreID ORDER BY createdat DESC";
			return (await connection.QueryAsync<Models.Product>(sql, new { StoreID = storeId })).ToList();
		}

		public async Task<int> CreateAsync(Models.Product product)
		{
			using var connection = _context.CreateConnection();
			var sql = @"
                INSERT INTO products (storeid, productname, description, price, stockquantity, category, imageurl, createdat, updatedat)
                VALUES (@StoreID, @ProductName, @Description, @Price, @StockQuantity, @Category, @ImageUrl, @CreatedAt, @UpdatedAt)
                RETURNING productid";

			var productId = await connection.ExecuteScalarAsync<int>(sql, new
			{
				product.StoreID,
				product.ProductName,
				product.Description,
				product.Price,
				product.StockQuantity,
				product.Category,
				product.ImageUrl,
				CreatedAt = DateTime.UtcNow,
				UpdatedAt = DateTime.UtcNow
			});

			// Index in vector database for semantic search
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
				await _semanticSearch.IndexProductAsync(productId, embedding, metadata);
			}
			catch (Exception ex)
			{
				Console.WriteLine($"⚠️ Failed to index product {productId}: {ex.Message}");
			}

			return productId;
		}

		public async Task<bool> UpdateAsync(Models.Product product)
		{
			using var connection = _context.CreateConnection();
			var sql = @"
                UPDATE products 
                SET productname = @ProductName, 
                    description = @Description, 
                    price = @Price, 
                    stockquantity = @StockQuantity, 
                    category = @Category, 
                    imageurl = @ImageUrl, 
                    updatedat = @UpdatedAt
                WHERE productid = @ProductID";

			var affected = await connection.ExecuteAsync(sql, new
			{
				product.ProductName,
				product.Description,
				product.Price,
				product.StockQuantity,
				product.Category,
				product.ImageUrl,
				UpdatedAt = DateTime.UtcNow,
				product.ProductID
			});

			if (affected > 0)
			{
				// Re-index in vector database
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
				}
				catch (Exception ex)
				{
					Console.WriteLine($"⚠️ Failed to re-index product {product.ProductID}: {ex.Message}");
				}
			}

			return affected > 0;
		}

		public async Task<bool> DeleteAsync(int productId)
		{
			using var connection = _context.CreateConnection();
			var sql = "DELETE FROM products WHERE productid = @ProductID";
			var affected = await connection.ExecuteAsync(sql, new { ProductID = productId });
			
			if (affected > 0)
			{
				// Remove from vector database
				try
				{
					await _semanticSearch.DeleteProductAsync(productId);
				}
				catch (Exception ex)
				{
					Console.WriteLine($"⚠️ Failed to delete product {productId} from vector index: {ex.Message}");
				}
			}
			
			return affected > 0;
		}

		public async Task<bool> ExistsByNameAsync(string productName, int storeId)
		{
			using var connection = _context.CreateConnection();
			var count = await connection.ExecuteScalarAsync<int>(
				"SELECT COUNT(1) FROM products WHERE productname = @ProductName AND storeid = @StoreID",
				new { ProductName = productName, StoreID = storeId });
			return count > 0;
		}
	}
}