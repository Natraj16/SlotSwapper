# SlotSwapper Setup Script for Windows PowerShell

Write-Host "🔄 SlotSwapper - Setup Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion detected`n" -ForegroundColor Green

# Backend Setup
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed`n" -ForegroundColor Green

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "📝 Please edit backend\.env and add your MongoDB Atlas connection string!" -ForegroundColor Cyan
    Write-Host "   Get it from: https://www.mongodb.com/cloud/atlas`n" -ForegroundColor Cyan
}

# Frontend Setup
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed`n" -ForegroundColor Green

# Return to root
Set-Location ..

Write-Host "`n✨ Setup Complete!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env and add your MongoDB Atlas connection string" -ForegroundColor White
Write-Host "2. Open TWO terminal windows:" -ForegroundColor White
Write-Host "   Terminal 1: cd backend; npm run dev" -ForegroundColor Yellow
Write-Host "   Terminal 2: cd frontend; npm run dev" -ForegroundColor Yellow
Write-Host "3. Open http://localhost:5173 in your browser`n" -ForegroundColor White

Write-Host "🔗 MongoDB Atlas Setup:" -ForegroundColor Cyan
Write-Host "   • Sign up: https://www.mongodb.com/cloud/atlas" -ForegroundColor White
Write-Host "   • Create a free cluster" -ForegroundColor White
Write-Host "   • Get connection string: Connect > Connect your application" -ForegroundColor White
Write-Host "   • Update MONGODB_URI in backend\.env`n" -ForegroundColor White

Write-Host "Happy Swapping! 🔄" -ForegroundColor Green
