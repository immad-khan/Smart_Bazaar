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

		public ProductService(DatabaseContext context)
		{
			_context = context;
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

			return affected > 0;
		}

		public async Task<bool> DeleteAsync(int productId)
		{
			using var connection = _context.CreateConnection();
			var sql = "DELETE FROM products WHERE productid = @ProductID";
			var affected = await connection.ExecuteAsync(sql, new { ProductID = productId });
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