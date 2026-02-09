# 健康數據記錄工具

一個離線運行的Web版健康數據記錄工具，用於記錄和追蹤每日健康數據。

## 功能特點

- 📊 **數據記錄**：記錄體重、身高、血壓（收縮壓/舒張壓）、心跳等健康數據
- 🧮 **自動計算BMI**：根據體重和身高自動計算BMI指數
- 📈 **數據可視化**：將指定日期區間內的歷史數據繪製成圖表
- 🎨 **智能顏色標記**：根據血壓數值自動判斷正常/不正常狀態
  - 綠色點：收縮壓 < 140 且 舒張壓 < 90（正常）
  - 紅色點：收縮壓 ≥ 140 或 舒張壓 ≥ 90（不正常）
- 💾 **本地數據庫**：使用IndexedDB存儲數據，完全離線運行
- 🎯 **完全開源**：不使用任何Google AI或API Key，僅使用免費開源資源

## 使用方法

### 1. 下載Chart.js庫（完全離線運行）

為了完全離線運行，您需要下載Chart.js庫文件：

1. 訪問 https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
2. 將文件保存為 `chart.js`，放在與 `index.html` 相同的目錄下

或者使用命令行下載：

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js -OutFile chart.js
```

**Linux/Mac:**
```bash
curl -L https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js -o chart.js
```

### 2. 打開應用

直接在瀏覽器中打開 `index.html` 文件即可使用。

**注意**：如果沒有下載 `chart.js` 文件，應用會自動使用CDN載入Chart.js庫，但這需要網絡連接。為了完全離線運行，請確保已下載 `chart.js` 文件。

## 文件結構

```
健康數據記錄工具/
├── index.html      # 主頁面
├── style.css       # 樣式文件
├── app.js          # 主要邏輯
├── chart.js        # Chart.js庫（需要手動下載）
└── README.md       # 說明文件
```

## 使用說明

### 輸入健康數據

1. 選擇日期（默認為今天）
2. 輸入體重（kg）
3. 輸入身高（cm）
4. BMI會自動計算並顯示
5. 輸入收縮壓（mmHg）
6. 輸入舒張壓（mmHg）
7. 輸入心跳（bpm）
8. 點擊「儲存數據」按鈕

### 查看圖表

1. 選擇開始日期和結束日期（默認為最近30天）
2. 點擊「載入圖表」按鈕
3. 圖表會顯示該日期區間內的血壓和心跳數據
4. 綠色點表示血壓正常，紅色點表示血壓不正常

### 查看歷史記錄

點擊「載入所有記錄」按鈕可以查看所有已保存的健康數據記錄。

## 技術說明

- **前端框架**：純HTML + CSS + JavaScript（無框架依賴）
- **數據庫**：IndexedDB（瀏覽器內置，無需後端）
- **圖表庫**：Chart.js 4.4.0（開源免費）
- **離線支持**：完全離線運行，無需網絡連接（需下載Chart.js）

## 瀏覽器兼容性

- Chrome/Edge（推薦）
- Firefox
- Safari
- Opera

**注意**：需要支持IndexedDB的現代瀏覽器。

## 數據存儲

所有數據都存儲在瀏覽器的IndexedDB中，名為 `HealthDataDB`。數據完全本地化，不會上傳到任何服務器。

## 許可證

本工具使用開源資源開發，可自由使用和修改。
