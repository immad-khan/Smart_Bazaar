using System.Net;
using System.Net.Mail;

namespace SmartBazaar.API.Services
{
	public interface IEmailService
	{
		Task<bool> SendConfirmationCodeAsync(string toEmail, string code);
		Task<bool> SendApprovalNotificationAsync(string toEmail, string fullName);
		Task<bool> SendRejectionNotificationAsync(string toEmail, string fullName, string reason);
	}

	public class EmailService : IEmailService
	{
		private readonly IConfiguration _configuration;
		private readonly ILogger<EmailService> _logger;

		public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
		{
			_configuration = configuration;
			_logger = logger;
		}

		public async Task<bool> SendConfirmationCodeAsync(string toEmail, string code)
		{
			try
			{
				var subject = "SmartBazaar - Email Confirmation Code";
				var body = $@"
					<html>
					<body style='font-family: Arial, sans-serif;'>
						<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
							<h2 style='color: #7C3AED;'>Welcome to SmartBazaar!</h2>
							<p>Thank you for registering with SmartBazaar.</p>
							<p>Your email confirmation code is:</p>
							<div style='background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;'>
								<h1 style='color: #7C3AED; letter-spacing: 5px; margin: 0;'>{code}</h1>
							</div>
							<p>This code will expire in 15 minutes.</p>
							<p>If you didn't request this code, please ignore this email.</p>
							<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;'>
							<p style='color: #6b7280; font-size: 12px;'>SmartBazaar - Your Local Shopping Marketplace</p>
						</div>
					</body>
					</html>
				";

				return await SendEmailAsync(toEmail, subject, body);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error sending confirmation code email to {Email}", toEmail);
				return false;
			}
		}

		public async Task<bool> SendApprovalNotificationAsync(string toEmail, string fullName)
		{
			try
			{
				var subject = "SmartBazaar - Account Approved!";
				var body = $@"
					<html>
					<body style='font-family: Arial, sans-serif;'>
						<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
							<h2 style='color: #10b981;'>Congratulations {fullName}!</h2>
							<p>Your SmartBazaar seller account has been approved by our admin team.</p>
							<p>You can now:</p>
							<ul>
								<li>Create and manage your stores</li>
								<li>Add products to your inventory</li>
								<li>Start selling to customers</li>
							</ul>
							<p>Login to your account to get started!</p>
							<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;'>
							<p style='color: #6b7280; font-size: 12px;'>SmartBazaar - Your Local Shopping Marketplace</p>
						</div>
					</body>
					</html>
				";

				return await SendEmailAsync(toEmail, subject, body);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error sending approval notification to {Email}", toEmail);
				return false;
			}
		}

		public async Task<bool> SendRejectionNotificationAsync(string toEmail, string fullName, string reason)
		{
			try
			{
				var subject = "SmartBazaar - Account Status Update";
				var body = $@"
					<html>
					<body style='font-family: Arial, sans-serif;'>
						<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
							<h2 style='color: #ef4444;'>Account Review Update</h2>
							<p>Dear {fullName},</p>
							<p>Thank you for your interest in SmartBazaar.</p>
							<p>Unfortunately, we are unable to approve your seller account at this time.</p>
							<p><strong>Reason:</strong> {reason}</p>
							<p>If you have any questions or would like to reapply, please contact our support team.</p>
							<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;'>
							<p style='color: #6b7280; font-size: 12px;'>SmartBazaar - Your Local Shopping Marketplace</p>
						</div>
					</body>
					</html>
				";

				return await SendEmailAsync(toEmail, subject, body);
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error sending rejection notification to {Email}", toEmail);
				return false;
			}
		}

		private async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
		{
			try
			{
				var smtpServer = _configuration["Email:SmtpServer"];
				var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
				var senderEmail = _configuration["Email:SenderEmail"];
				var senderPassword = _configuration["Email:SenderPassword"];
				var senderName = _configuration["Email:SenderName"];

				using var smtpClient = new SmtpClient(smtpServer, smtpPort)
				{
					EnableSsl = true,
					Credentials = new NetworkCredential(senderEmail, senderPassword)
				};

				var mailMessage = new MailMessage
				{
					From = new MailAddress(senderEmail!, senderName),
					Subject = subject,
					Body = body,
					IsBodyHtml = true
				};

				mailMessage.To.Add(toEmail);

				await smtpClient.SendMailAsync(mailMessage);
				_logger.LogInformation("Email sent successfully to {Email}", toEmail);
				return true;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error sending email to {Email}", toEmail);
				return false;
			}
		}
	}
}
