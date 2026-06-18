Yes, the startup sequence is:

Start Docker Desktop (if not already running)
Start Qdrant container: docker start qdrant (or docker run -d -p 6333:6333 -p 6334:6334 --name qdrant qdrant/qdrant:latest if it doesn't exist)
Run the API: cd SmartBazaar.API; dotnet run
Simpler option - Create a startup script start-dev.ps1:
# Start Docker Desktop if not running
if (-not (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Waiting for Docker to start..."
    Start-Sleep -Seconds 15
}

# Start or restart Qdrant
docker start qdrant 2>$null
if ($LASTEXITCODE -ne 0) {
    docker run -d -p 6333:6333 -p 6334:6334 --name qdrant qdrant/qdrant:latest
}

Write-Host "Qdrant running on http://localhost:6333" -ForegroundColor Green

# Start API
cd SmartBazaar.API
dotnet run

Then just run: .\start-dev.ps1

The Qdrant container will stay running even after you close the API, so on subsequent runs you just need docker start qdrant (if it stopped) and dotnet run


# Smart Bazaar - Full Stack Application
start krny k liay run kro
cd d:\Desktop\smart_bazaar
.\start.ps1
Start the backend (in one terminal):
cd d:\Desktop\smart_bazaar\SmartBazaar.API
dotnet run
Start the frontend (in another terminal):
cd d:\Desktop\smart_bazaar\SmartBazaar.API
npm install  # if not already done
npm run dev
## Project Structure
- **Backend**: .NET 10.0 API (Port 5000)
- **Frontend**: React + Vite (Port 3000)

## Getting Started

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Start the Backend API
```bash
dotnet run --urls "http://localhost:5000"
```

### 3. Start the Frontend (in a new terminal)
```bash
npm run dev
```

### 4. Open Application
Navigate to: http://localhost:3000

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `dotnet run` - Start API server
- `dotnet build` - Build the project
- `dotnet watch run` - Start with hot reload

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/scraper/search?q=query` - Search products
- `GET /api/scraper/test-naheed?url=productUrl` - Scrape single product

## Features
- 🔍 Unified search across Pakistani markets
- 🎨 Beautiful 3D animated background
- 📱 Responsive design
- ⚡ Fast API with real-time scraping
- 🛒 Direct product links
 
 🚀 How to Run
cd SmartBazaar.API
npm install
npm run dev1


Links to open in browser:
🌐 Main Application: http://localhost:3000

This is what you'll demo - the React frontend with search, products, etc.
📡 API (for testing): http://localhost:5009

Backend endpoints like /api/scraper/search?q=rice
📊 Qdrant Dashboard: http://localhost:6333/dashboard

View your vector database
Or use the automated script:
This will open both terminals automatically, and you can access the app at http://localhost:3000! 🚀