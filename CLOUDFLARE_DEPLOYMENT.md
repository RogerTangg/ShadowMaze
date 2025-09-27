# Cloudflare Pages 部署設定

## 最近修改與修復

我們修復了以下問題，使遊戲能夠在 Cloudflare Pages 上正常運行：

1. **模塊化 JavaScript**：
   - 將所有 JS 文件修改為 ES6 模塊格式
   - 為每個類添加了 `export` 關鍵字
   - 在 `game.js` 中添加了正確的 `import` 語句

2. **整合資源加載**：
   - 簡化了 HTML 中的腳本引用，只需引用主要的 `game.js`
   - 所有依賴都通過 import/export 系統自動加載

3. **構建優化**：
   - 添加了 `build:client` 命令專門用於前端構建
   - 配置了 Vite 以正確處理靜態資源和模塊

## 構建設定

### Build Command (構建命令):
```
npm run build:client
```

### Output Directory (輸出目錄):
```
dist/public
```

### Root Directory (根目錄):
```
/
```

### Environment Variables (環境變數):
```
NODE_VERSION=18
```

## 部署步驟

1. **推送程式碼到 GitHub**:
   ```bash
   git add .
   git commit -m "Fix module imports and resource paths for Cloudflare deployment"
   git push origin main
   ```

2. **在 Cloudflare Pages 中設定**:
   - 進入 Cloudflare Dashboard > Pages
   - 點擊 "Create a project" > "Connect to Git"
   - 選擇您的 ShadowMaze 儲存庫
   - 設定構建設定：
     - Build command: `npm run build:client`
     - Output directory: `dist/public`
     - Root directory: `/`
   - 點擊 "Save and Deploy"

3. **驗證部署**:
   - 等待構建完成
   - 訪問提供的 URL 測試遊戲功能

## 修復的問題

✅ **模組導入問題**: 
   - 為所有類添加了 `export` 關鍵字
   - 在 `game.js` 中添加了正確的 `import` 語句
   - 簡化了 HTML 中的腳本引用，移除了多餘的腳本標籤
   
✅ **資源路徑問題**: 
   - 配置了正確的 Vite 構建設定
   - 確保所有靜態資源都能被正確引用
   
✅ **MIME 類型問題**: 
   - 添加了 `_headers` 檔案設定音效和其他資源的正確類型
   
✅ **構建配置**: 
   - 分離了客戶端構建命令以便 Cloudflare Pages 使用
   - 優化了構建輸出

## 注意事項

- 所有靜態資源 (音效、紋理、字體) 都會被正確複製到構建輸出中
- 遊戲使用純 JavaScript 實作，不依賴 React，適合靜態網站部署
- 音效載入可能需要使用者互動才能播放 (瀏覽器政策)

## 疑難排解

如果遇到問題：
1. 檢查 Cloudflare Pages 的構建日誌
2. 確認所有依賴項都已安裝
3. 驗證資源檔案路徑是否正確

## 本地測試部署前

在部署到 Cloudflare Pages 之前，強烈建議在本地測試構建結果：

```bash
npm run build:client
npx serve dist/public
```

這將在本地啟動一個簡單的靜態伺服器，讓您可以測試遊戲是否能正常運行。確保所有的資源（圖像、音效等）都能正確加載。