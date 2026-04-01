# PolicyPilotAI — Full AWS Deployment Script
# Run from: d:\SD\projects\Guid wire\diployment\M3AWS
# Usage: .\deploy_all.ps1

$env:PATH += ";C:\Program Files\Amazon\AWSCLIV2"
$REGION    = "us-east-1"
$ACCOUNT   = "855603408059"
$ECR_REPO  = "policypilotai-ml"
$APP_NAME  = "policypilotai-ml-service"
$IMAGE_URI = "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/$($ECR_REPO):latest"

Write-Host "`n=====================================" -ForegroundColor Magenta
Write-Host " PolicyPilotAI — AWS Deployer v1.0  " -ForegroundColor Magenta
Write-Host "=====================================`n" -ForegroundColor Magenta

# ─── PHASE 1: ML SERVICE (Docker → ECR → App Runner) ─────────────────────────
Write-Host "📦 PHASE 1: ML Microservice (App Runner)" -ForegroundColor Cyan

# 1a. ECR login
Write-Host "  🔐 Logging into ECR..."
$token = aws ecr get-login-password --region $REGION
$token | docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"
if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ ECR login failed"; exit 1 }

# 1b. Create ECR repo if needed
Write-Host "  📂 Ensuring ECR repo exists..."
aws ecr describe-repositories --repository-names $ECR_REPO --region $REGION 2>$null
if ($LASTEXITCODE -ne 0) {
    aws ecr create-repository --repository-name $ECR_REPO --region $REGION | Out-Null
    Write-Host "  ✅ Repo created." -ForegroundColor Green
}

# 1c. Docker build
Write-Host "  🏗️  Building Docker image (this takes ~3-5 min)..."
docker build -t $ECR_REPO "d:\SD\projects\Guid wire\diployment\M3AWS\ml_service"
if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Docker build failed"; exit 1 }
Write-Host "  ✅ Build complete." -ForegroundColor Green

# 1d. Tag and push
Write-Host "  🏷️  Tagging and pushing to ECR..."
docker tag "$($ECR_REPO):latest" $IMAGE_URI
docker push $IMAGE_URI
if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Push failed"; exit 1 }
Write-Host "  ✅ Image pushed: $IMAGE_URI" -ForegroundColor Green

# 1e. App Runner — create or update
Write-Host "  🚀 Deploying to App Runner..."
$existingArn = aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$APP_NAME'].ServiceArn" --output text --region $REGION
if ($existingArn -and $existingArn -ne "None") {
    Write-Host "  🔄 Service exists, triggering new deployment..."
    aws apprunner start-deployment --service-arn $existingArn --region $REGION | Out-Null
    Write-Host "  ✅ Deployment triggered. ARN: $existingArn" -ForegroundColor Green
} else {
    Write-Host "  ✨ Creating new App Runner service..."
    $svc = aws apprunner create-service `
        --service-name $APP_NAME `
        --source-configuration "{
            `"AuthenticationConfiguration`":{`"AccessRoleArn`":`"arn:aws:iam::$ACCOUNT:role/AppRunnerECRAccessRole`"},
            `"AutoDeploymentsEnabled`":true,
            `"ImageRepository`":{
                `"ImageIdentifier`":`"$IMAGE_URI`",
                `"ImageConfiguration`":{`"Port`":`"8001`"},
                `"ImageRepositoryType`":`"ECR`"
            }
        }" `
        --instance-configuration "{`"Cpu`":`"1 vCPU`",`"Memory`":`"2 GB`"}" `
        --region $REGION | ConvertFrom-Json
    $ML_URL = $svc.Service.ServiceUrl
    Write-Host "  ✅ App Runner service created!" -ForegroundColor Green
    Write-Host "  🌐 ML Service URL: https://$ML_URL" -ForegroundColor Yellow
}

# ─── PHASE 2: BACKEND (Serverless → Lambda) ───────────────────────────────────
Write-Host "`n📦 PHASE 2: Backend API (Lambda + API Gateway)" -ForegroundColor Cyan

Set-Location "d:\SD\projects\Guid wire\diployment\M3AWS\backend"

# 2a. Build
Write-Host "  🏗️  Building TypeScript..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ TypeScript build failed"; exit 1 }
Write-Host "  ✅ Build complete." -ForegroundColor Green

# 2b. Deploy via Serverless
Write-Host "  🚀 Deploying with Serverless Framework..."
npx serverless deploy --region $REGION
if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Serverless deploy failed"; exit 1 }
Write-Host "  ✅ Backend deployed to Lambda!" -ForegroundColor Green

Write-Host "`n=====================================" -ForegroundColor Magenta
Write-Host " ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host " Check App Runner console for ML URL." -ForegroundColor Yellow
Write-Host "=====================================`n" -ForegroundColor Magenta
