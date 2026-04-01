# PolicyPilotAI ML Service — AWS App Runner Deploy
# Usage: .\deploy_ml.ps1 -Region us-east-1

param (
    [string]$Region = "us-east-1",
    [string]$RepoName = "policypilotai-ml",
    [string]$ServiceName = "policypilotai-ml-service"
)

# 1. Get AWS Account ID
$AccountId = (aws sts get-caller-identity --query Account --output text)
if (-not $AccountId) { Write-Error "❌ Not authenticated with AWS CLI."; exit 1 }

$FullImageName = "$AccountId.dkr.ecr.$Region.amazonaws.com/$RepoName:latest"

Write-Host "🚀 Deploying $RepoName to $Region..." -ForegroundColor Cyan

# 2. Create ECR Repo if it doesn't exist
aws ecr describe-repositories --repository-names $RepoName --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "📦 Creating ECR repository: $RepoName..."
    aws ecr create-repository --repository-name $RepoName --region $Region
}

# 3. Authenticate Docker to ECR
Write-Host "🔐 Authenticating Docker to ECR..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"

# 4. Build and Tag Docker Image
Write-Host "🏗️ Building Docker image..."
docker build -t $RepoName .
docker tag "$RepoName:latest" $FullImageName

# 5. Push to ECR
Write-Host "📤 Pushing image to ECR..."
docker push $FullImageName

# 6. Check if App Runner service exists
$ServiceArn = (aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$ServiceName'].ServiceArn" --output text)

if ($ServiceArn) {
    Write-Host "🔄 Service exists. Starting new deployment..."
    aws apprunner start-deployment --service-arn $ServiceArn
} else {
    Write-Host "✨ Creating new App Runner service: $ServiceName..."
    # Note: Requires an IAM role for App Runner to pull from ECR.
    # We'll try a simplified create command; if it fails, the user may need to finalize in console.
    aws apprunner create-service `
        --service-name $ServiceName `
        --source-configuration "{
            `"AuthenticationConfiguration`": { `"AccessRoleArn`": `"arn:aws:iam::$AccountId:role/service-role/AppRunnerECRAccessRole`" },
            `"ImageRepository`": {
                `"ImageIdentifier`": `"$FullImageName`",
                `"ImageConfiguration`": { `"Port`": `"8001`" },
                `"ImageRepositoryType`": `"ECR`"
            }
        }" `
        --region $Region
}

Write-Host "✅ Deployment initiated! Check AWS App Runner console for progress." -ForegroundColor Green
