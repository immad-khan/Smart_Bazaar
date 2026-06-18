using System;
using System.Threading.Tasks;
using Dapper;
using SmartBazaar.API.Data;

namespace SmartBazaar.API.Services
{
	public class SellerService
	{
		private readonly DatabaseContext _context;

		public SellerService(DatabaseContext context)
		{
			_context = context;
		}

		public async Task<Models.Seller?> GetByEmailAsync(string email)
		{
			using var connection = _context.CreateConnection();
			return await connection.QueryFirstOrDefaultAsync<Models.Seller>(
				"SELECT * FROM sellers WHERE email = @Email", new { Email = email });
		}

		public async Task<int> CreateAsync(Models.Seller seller)
		{
			using var connection = _context.CreateConnection();
			var sql = @"
                INSERT INTO sellers (firstname, lastname, email, password, phonenumber, createdat, updatedat)
                VALUES (@FirstName, @LastName, @Email, @Password, @PhoneNumber, @CreatedAt, @UpdatedAt)
                RETURNING sellerid";

			return await connection.ExecuteScalarAsync<int>(sql, new
			{
				seller.FirstName,
				seller.LastName,
				seller.Email,
				seller.Password,
				seller.PhoneNumber,
				CreatedAt = DateTime.UtcNow,
				UpdatedAt = DateTime.UtcNow
			});
		}

		public async Task<bool> ExistsByEmailAsync(string email)
		{
			using var connection = _context.CreateConnection();
			var count = await connection.ExecuteScalarAsync<int>(
				"SELECT COUNT(1) FROM sellers WHERE email = @Email", new { Email = email });
			return count > 0;
		}
	}
}