# PolicyPilotAI Backend — AWS Lambda (Serverless) Deploy
# Usage: .\deploy_backend.ps1

Write-Host "🚀 Preparing PolicyPilotAI Backend Deployment..." -ForegroundColor Cyan

# 1. Build TypeScript
Write-Host "🏗️ Building TypeScript..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "❌ Build failed."; exit 1 }

# 2. Check for Serverless
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Error "❌ npm/npx not found."
    exit 1
}

# 3. Deploy to AWS Lambda
# We use npx to avoid requiring a global 'serverless' install.
Write-Host "📤 Deploying to AWS Lambda via Serverless..."
# User may need to set environment variables in AWS Lambda Console after first deploy
# Or pass them as --param if needed.
npx serverless deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed. Check the logs above." -ForegroundColor Red
}
