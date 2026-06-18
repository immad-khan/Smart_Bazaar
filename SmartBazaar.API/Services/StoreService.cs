using System;
using System.Threading.Tasks;
using Dapper;
using SmartBazaar.API.Data;

namespace SmartBazaar.API.Services
{
	public class StoreService
	{
		private readonly DatabaseContext _context;

		public StoreService(DatabaseContext context)
		{
			_context = context;
		}

public async Task<Models.Store?> GetBySellerIdAsync(int sellerId)
		{
			using var connection = _context.CreateConnection();
		return await connection.QueryFirstOrDefaultAsync<Models.Store>("SELECT * FROM stores WHERE sellerid = @SellerID", new { SellerID = sellerId });
	}

	public async Task<int> CreateAsync(Models.Store store)
	{
		using var connection = _context.CreateConnection();
		var sql = @"
			INSERT INTO stores (sellerid, storename, address, contactnumber, description, latitude, longitude, googlemapsurl, createdat, updatedat)
			VALUES (@SellerID, @StoreName, @Address, @ContactNumber, @Description, @Latitude, @Longitude, @GoogleMapsUrl, @CreatedAt, @UpdatedAt)
			RETURNING storeid";
		
		return await connection.ExecuteScalarAsync<int>(sql, new
		{
			store.SellerID,
			store.StoreName,
			store.Address,
			store.ContactNumber,
			store.Description,
			store.Latitude,
			store.Longitude,
			store.GoogleMapsUrl,
			CreatedAt = DateTime.UtcNow,
			UpdatedAt = DateTime.UtcNow
		});
	}

		public async Task<bool> ExistsByNameAsync(string storeName, int sellerId)
		{
			using var connection = _context.CreateConnection();
			var count = await connection.ExecuteScalarAsync<int>(
				"SELECT COUNT(1) FROM stores WHERE storename = @StoreName AND sellerid = @SellerID",
				new { StoreName = storeName, SellerID = sellerId });
			return count > 0;
		}

		public async Task<IEnumerable<Models.Store>> GetAllStoresAsync()
		{
			using var connection = _context.CreateConnection();
			return await connection.QueryAsync<Models.Store>("SELECT * FROM stores ORDER BY storename");
		}
	}
}