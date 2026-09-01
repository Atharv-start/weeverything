# Daily GitHub Streak Automation Script for Windows
# Run this script manually or configure it with Windows Task Scheduler

Write-Host "🚀 Running daily activity updater..." -ForegroundColor Cyan

# Change directory to repo root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
Set-Location $RepoRoot

# Execute update script
node scripts/daily-update.mjs

# Check for git changes
$GitStatus = git status --porcelain docs/daily-activity.md

if ($GitStatus) {
    Write-Host "📝 Staging changes..." -ForegroundColor Yellow
    git add docs/daily-activity.md
    
    $DateStr = Get-Date -Format "yyyy-MM-dd"
    $CommitMsg = "chore(streak): update daily telemetry and feature progress [$DateStr]"
    
    Write-Host "💾 Committing: $CommitMsg" -ForegroundColor Green
    git commit -m $CommitMsg
    
    Write-Host "⬆️ Pushing to origin/main..." -ForegroundColor Cyan
    git push origin main
    
    Write-Host "✅ Streak maintained! Green square added for today." -ForegroundColor Green
} else {
    Write-Host "ℹ️ No new changes to commit for today." -ForegroundColor Gray
}
