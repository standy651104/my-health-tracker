// IndexedDB 數據庫配置
const DB_NAME = 'HealthDataDB';
const DB_VERSION = 1;
const STORE_NAME = 'healthRecords';

let db = null;
let healthChart = null;

// 初始化數據庫
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('數據庫打開失敗');
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('數據庫打開成功');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('date', 'date', { unique: false });
            }
        };
    });
}

// 保存健康數據
async function saveHealthData(data) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('數據庫未初始化'));
            return;
        }

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // 檢查該日期是否已有記錄
        const index = store.index('date');
        const getRequest = index.getAll(data.date);

        getRequest.onsuccess = () => {
            const existingRecords = getRequest.result;
            const request = existingRecords.length > 0 
                ? store.put({ ...existingRecords[0], ...data }) // 更新現有記錄
                : store.add(data); // 新增記錄

            request.onsuccess = () => {
                console.log('數據保存成功');
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('數據保存失敗');
                reject(request.error);
            };
        };
    });
}

// 獲取所有健康數據
async function getAllHealthData() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('數據庫未初始化'));
            return;
        }

        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            // 按日期排序
            const data = request.result.sort((a, b) => new Date(a.date) - new Date(b.date));
            resolve(data);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// 根據日期區間獲取數據
async function getHealthDataByDateRange(startDate, endDate) {
    const allData = await getAllHealthData();
    return allData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
}

// 刪除健康數據
async function deleteHealthData(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('數據庫未初始化'));
            return;
        }

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// 計算BMI
function calculateBMI(weight, height) {
    if (!weight || !height || height === 0) {
        return null;
    }
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// 判斷血壓是否正常
function isBloodPressureNormal(systolic, diastolic) {
    return systolic < 140 && diastolic < 90;
}

// 顯示消息
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container main');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 初始化表單
function initForm() {
    const form = document.getElementById('healthForm');
    const dateInput = document.getElementById('date');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const bmiDisplay = document.getElementById('bmiDisplay');

    // 設置默認日期為今天
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // 實時計算BMI
    function updateBMI() {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        const bmi = calculateBMI(weight, height);
        bmiDisplay.textContent = bmi || '--';
    }

    weightInput.addEventListener('input', updateBMI);
    heightInput.addEventListener('input', updateBMI);

    // 表單提交
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const healthData = {
            date: dateInput.value,
            weight: parseFloat(weightInput.value),
            height: parseFloat(heightInput.value),
            systolic: parseInt(document.getElementById('systolic').value),
            diastolic: parseInt(document.getElementById('diastolic').value),
            heartRate: parseInt(document.getElementById('heartRate').value),
            bmi: parseFloat(calculateBMI(parseFloat(weightInput.value), parseFloat(heightInput.value)))
        };

        try {
            await saveHealthData(healthData);
            showMessage('數據保存成功！', 'success');
            form.reset();
            dateInput.value = today;
            bmiDisplay.textContent = '--';
            
            // 如果圖表已載入，更新圖表
            if (healthChart) {
                loadChart();
            }
        } catch (error) {
            console.error('保存失敗:', error);
            showMessage('數據保存失敗，請重試', 'error');
        }
    });
}

// 繪製圖表
async function loadChart() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        showMessage('請選擇開始日期和結束日期', 'error');
        return;
    }

    try {
        const data = await getHealthDataByDateRange(startDate, endDate);

        if (data.length === 0) {
            showMessage('該日期區間內沒有數據', 'error');
            return;
        }

        const ctx = document.getElementById('healthChart').getContext('2d');

        // 準備圖表數據
        const labels = data.map(record => {
            const date = new Date(record.date);
            return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
        });

        // 準備收縮壓和舒張壓數據
        const systolicData = data.map(record => record.systolic);
        const diastolicData = data.map(record => record.diastolic);
        const heartRateData = data.map(record => record.heartRate);

        // 根據血壓狀態設置點顏色
        const pointBackgroundColors = data.map(record => 
            isBloodPressureNormal(record.systolic, record.diastolic) ? '#28a745' : '#dc3545'
        );
        const pointBorderColors = data.map(record => 
            isBloodPressureNormal(record.systolic, record.diastolic) ? '#28a745' : '#dc3545'
        );

        // 銷毀舊圖表
        if (healthChart) {
            healthChart.destroy();
        }

        // 創建新圖表
        healthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '收縮壓 (mmHg)',
                        data: systolicData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        pointBackgroundColor: pointBackgroundColors,
                        pointBorderColor: pointBorderColors,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: '舒張壓 (mmHg)',
                        data: diastolicData,
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        pointBackgroundColor: pointBackgroundColors,
                        pointBorderColor: pointBorderColors,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: '心跳 (bpm)',
                        data: heartRateData,
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        pointBackgroundColor: '#f39c12',
                        pointBorderColor: '#f39c12',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const record = data[index];
                                return [
                                    `BMI: ${record.bmi}`,
                                    `體重: ${record.weight} kg`,
                                    `身高: ${record.height} cm`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '血壓 (mmHg)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '心跳 (bpm)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    } catch (error) {
        console.error('載入圖表失敗:', error);
        showMessage('載入圖表失敗，請重試', 'error');
    }
}

// 載入數據列表
async function loadDataList() {
    try {
        const data = await getAllHealthData();
        const dataList = document.getElementById('dataList');
        
        if (data.length === 0) {
            dataList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">尚無記錄數據</p>';
            return;
        }

        dataList.innerHTML = data.reverse().map(record => {
            const date = new Date(record.date);
            const dateStr = date.toLocaleDateString('zh-TW', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const isNormal = isBloodPressureNormal(record.systolic, record.diastolic);
            const statusColor = isNormal ? '#28a745' : '#dc3545';
            const statusText = isNormal ? '正常' : '不正常';

            return `
                <div class="data-item">
                    <div class="data-item-info">
                        <div class="data-item-date">${dateStr}</div>
                        <div class="data-item-details">
                            <span>體重: ${record.weight} kg</span>
                            <span>身高: ${record.height} cm</span>
                            <span>BMI: ${record.bmi}</span>
                            <span>收縮壓: ${record.systolic} mmHg</span>
                            <span>舒張壓: ${record.diastolic} mmHg</span>
                            <span>心跳: ${record.heartRate} bpm</span>
                            <span style="color: ${statusColor}; font-weight: bold;">血壓狀態: ${statusText}</span>
                        </div>
                    </div>
                    <button class="delete-btn" onclick="deleteRecord(${record.id})">刪除</button>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('載入數據列表失敗:', error);
        showMessage('載入數據列表失敗', 'error');
    }
}

// 刪除記錄
async function deleteRecord(id) {
    if (!confirm('確定要刪除此記錄嗎？')) {
        return;
    }

    try {
        await deleteHealthData(id);
        showMessage('記錄已刪除', 'success');
        loadDataList();
        
        // 如果圖表已載入，更新圖表
        if (healthChart) {
            loadChart();
        }
    } catch (error) {
        console.error('刪除失敗:', error);
        showMessage('刪除失敗，請重試', 'error');
    }
}

// 設置日期選擇器的默認值
function initDateRange() {
    const endDate = document.getElementById('endDate');
    const startDate = document.getElementById('startDate');
    
    // 結束日期默認為今天
    const today = new Date().toISOString().split('T')[0];
    endDate.value = today;
    
    // 開始日期默認為30天前
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
}

// 初始化應用
async function init() {
    try {
        await initDB();
        initForm();
        initDateRange();
        
        // 綁定按鈕事件
        document.getElementById('loadChartBtn').addEventListener('click', loadChart);
        document.getElementById('loadDataBtn').addEventListener('click', loadDataList);
        
        // 自動載入數據列表
        loadDataList();
        
        console.log('應用初始化完成');
    } catch (error) {
        console.error('初始化失敗:', error);
        showMessage('應用初始化失敗，請刷新頁面重試', 'error');
    }
}

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 將deleteRecord函數暴露到全局作用域，以便HTML中的onclick可以使用
window.deleteRecord = deleteRecord;
