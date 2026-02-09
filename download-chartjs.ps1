# PowerShell腳本：下載Chart.js庫文件
# 使用方法：在PowerShell中運行此腳本

Write-Host "正在下載Chart.js庫文件..." -ForegroundColor Green

try {
    $url = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
    $output = "chart.js"
    
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    
    Write-Host "下載成功！文件已保存為 chart.js" -ForegroundColor Green
    Write-Host "現在您可以完全離線運行此應用程序了。" -ForegroundColor Cyan
} catch {
    Write-Host "下載失敗：$_" -ForegroundColor Red
    Write-Host "請檢查網絡連接，或手動訪問以下URL下載：" -ForegroundColor Yellow
    Write-Host "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" -ForegroundColor Yellow
}
