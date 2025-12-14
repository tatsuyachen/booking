# My Scheduler - 線上預約系統

這是一個整合 Google Calendar 的線上預約系統，建立於 React + Vite + Vercel Serverless Functions。

## 🚀 部署至 Vercel 步驟

### 1. 準備程式碼
將此專案 Push 到你的 GitHub Repository。

### 2. 匯入 Vercel
1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)。
2. 點擊 "Add New..." -> "Project"。
3. 選擇你的 GitHub Repository 並匯入。
4. Framework Preset 選擇 `Vite` (通常會自動偵測)。
5. Root Directory 保持預設 (`./`)。

### 3. 設定環境變數 (Environment Variables)

**這是最重要的一步！** 為了讓系統能連線到你的 Google 行事曆，請在 Vercel 的部署設定頁面（Environment Variables 區塊）新增以下變數：

| 變數名稱 (Name) | 填入數值 (Value) |
|---|---|
| `GOOGLE_CLIENT_EMAIL` | `booking-tatsuyachen@gen-lang-client-0586774803.iam.gserviceaccount.com` |
| `GOOGLE_CALENDAR_ID` | `tatsuya.chen1977@gmail.com` |
| `GOOGLE_PRIVATE_KEY` | 請填入你的 Private Key (以 `-----BEGIN PRIVATE KEY-----` 開頭，`-----END PRIVATE KEY-----` 結尾的完整字串) |

**注意：** 填寫 `GOOGLE_PRIVATE_KEY` 時，請直接複製整串文字貼上即可，不需要手動將 `\n` 換成換行，系統程式碼會自動處理。

---

## 🛠️ 本地開發

若要在本機測試 API 功能，你需要安裝 `vercel` CLI：

```bash
npm install -g vercel
```

然後使用以下指令啟動（這會模擬 Vercel 的 API 環境）：

```bash
vercel dev
```

(第一次執行時需登入 Vercel 並連結專案，並確保 Vercel 雲端上的環境變數已設定，`vercel dev` 會自動拉取下來使用)
