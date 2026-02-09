#!/bin/bash
# Bash腳本：下載Chart.js庫文件
# 使用方法：chmod +x download-chartjs.sh && ./download-chartjs.sh

echo "正在下載Chart.js庫文件..."

URL="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
OUTPUT="chart.js"

if curl -L "$URL" -o "$OUTPUT"; then
    echo "下載成功！文件已保存為 chart.js"
    echo "現在您可以完全離線運行此應用程序了。"
else
    echo "下載失敗，請檢查網絡連接"
    echo "或手動訪問以下URL下載："
    echo "$URL"
fi
