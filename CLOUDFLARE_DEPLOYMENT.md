# Cloudflare Pages 部署設定

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

✅ **模組導入問題**: 為 script 標籤添加了 `type="module"` 屬性
✅ **資源路徑問題**: 配置了正確的 Vite 構建設定
✅ **MIME 類型問題**: 添加了 `_headers` 檔案設定音效和其他資源的正確類型
✅ **構建配置**: 分離了客戶端構建命令以便 Cloudflare Pages 使用

## 注意事項

- 所有靜態資源 (音效、紋理、字體) 都會被正確複製到構建輸出中
- 遊戲使用純 JavaScript 實作，不依賴 React，適合靜態網站部署
- 音效載入可能需要使用者互動才能播放 (瀏覽器政策)

## 疑難排解

如果遇到問題：
1. 檢查 Cloudflare Pages 的構建日誌
2. 確認所有依賴項都已安裝
3. 驗證資源檔案路徑是否正確