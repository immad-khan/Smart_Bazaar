# SmartBazaar Authentication Setup Script
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SmartBazaar Authentication Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if appsettings.json exists
$appSettingsPath = "SmartBazaar.API/appsettings.json"
if (-not (Test-Path $appSettingsPath)) {
    Write-Host "❌ appsettings.json not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📧 Email Configuration" -ForegroundColor Yellow
Write-Host "----------------------------------"
Write-Host ""
Write-Host "To send emails, you need to configure SMTP settings."
Write-Host "For Gmail:"
Write-Host "1. Enable 2-Factor Authentication"
Write-Host "2. Generate an App Password: https://myaccount.google.com/apppasswords"
Write-Host "3. Use that App Password below"
Write-Host ""

$senderEmail = Read-Host "Enter your sender email address (e.g., your-email@gmail.com)"
$senderPassword = Read-Host "Enter your App Password (16 characters)" -AsSecureString
$senderPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($senderPassword))

Write-Host ""
Write-Host "🔐 JWT Secret Key" -ForegroundColor Yellow
Write-Host "----------------------------------"
Write-Host ""
Write-Host "Generating a secure JWT secret key..."

# Generate a random secret key
$secretKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "✓ Generated 64-character secret key" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Updating appsettings.json..." -ForegroundColor Yellow

# Read the current appsettings.json
$config = Get-Content $appSettingsPath -Raw | ConvertFrom-Json

# Update Email configuration
if (-not $config.Email) {
    $config | Add-Member -MemberType NoteProperty -Name "Email" -Value ([PSCustomObject]@{})
}
$config.Email.SenderEmail = $senderEmail
$config.Email.SenderPassword = $senderPasswordText

# Update JWT secret key
if ($config.Jwt) {
    $config.Jwt.SecretKey = $secretKey
}

# Save updated configuration
$config | ConvertTo-Json -Depth 10 | Set-Content $appSettingsPath

Write-Host "✓ Configuration updated successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "🗄️ Database Migration" -ForegroundColor Yellow
Write-Host "----------------------------------"
Write-Host ""
Write-Host "Next step: Run the database migration script"
Write-Host ""
Write-Host "Option 1: Supabase Dashboard" -ForegroundColor Cyan
Write-Host "  1. Go to: https://hatgzktkmsmzstoahrta.supabase.co"
Write-Host "  2. Navigate to SQL Editor"
Write-Host "  3. Copy and run the contents of: database_migrations.sql"
Write-Host ""
Write-Host "Option 2: psql CLI" -ForegroundColor Cyan
Write-Host '  psql "postgresql://postgres.hatgzktkmsmzstoahrta:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres" -f database_migrations.sql'
Write-Host ""

$runMigration = Read-Host "Would you like to view the migration script now? (y/n)"
if ($runMigration -eq 'y' -or $runMigration -eq 'Y') {
    Get-Content "database_migrations.sql"
    Write-Host ""
}

Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run database migrations (see above)"
Write-Host "2. Start the API: cd SmartBazaar.API; dotnet run"
Write-Host "3. Start the frontend: npm run dev"
Write-Host "4. Test registration flow"
Write-Host "5. Login as admin (admin@smartbazaar.com / Admin@123)"
Write-Host "6. IMPORTANT: Change the default admin password!"
Write-Host ""
Write-Host "📖 For detailed instructions, see: AUTH_SETUP_README.md"
Write-Host ""
