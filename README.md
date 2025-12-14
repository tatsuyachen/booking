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
在部署頁面的 "Environment Variables" 區塊，或部署後的 Settings -> Environment Variables 中，設定以下三個變數：

| 變數名稱 | 說明 |
|---------|------|
| `GOOGLE_CLIENT_EMAIL` | Google 服務帳戶的 Email |
| `GOOGLE_PRIVATE_KEY` | Google 服務帳戶的私鑰 (包含 `-----BEGIN...` 完整內容) |
| `GOOGLE_CALENDAR_ID` | 你要寫入的日曆 ID (通常是你的 Gmail 信箱) |

---

## 🔑 如何取得 Google Calendar 金鑰

為了讓系統能幫你自動新增行程，你需要設定 Google Cloud 服務帳戶：

1. **建立專案**
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)。
   - 建立一個新專案。

2. **啟用 API**
   - 在搜尋列輸入 **"Google Calendar API"** 並點擊啟用。

3. **建立服務帳戶 (Service Account)**
   - 前往「IAM 與管理員」 -> 「服務帳戶」。
   - 點擊「建立服務帳戶」，輸入名稱 (如 `scheduler-bot`)，權限可選「基本 -> 編輯者」或跳過。
   - 建立完成後，點擊該帳戶進入詳情頁。

4. **下載金鑰**
   - 在服務帳戶詳情頁，點選上方「金鑰 (Keys)」分頁。
   - 點擊「新增金鑰」->「建立新金鑰」-> 選擇 **JSON**。
   - 下載 JSON 檔案到電腦 (請妥善保管，不要外流)。

5. **設定日曆權限 (最重要的一步！)**
   - 打開剛剛下載的 JSON 檔案，複製 `client_email` 的值 (長得像 `xxx@project-id.iam.gserviceaccount.com`)。
   - 前往你的 [Google Calendar](https://calendar.google.com/)。
   - 在左側找到你要預約的日曆，點擊「設定和共用」。
   - 在「與特定使用者共用日曆」區塊，點擊「新增使用者」。
   - **貼上剛剛複製的 Email**。
   - **權限選擇：「變更活動」** (Make changes to events)。
   - 儲存。

6. **填寫 Vercel 環境變數**
   - `GOOGLE_CLIENT_EMAIL`: 填入 JSON 中的 `client_email`。
   - `GOOGLE_PRIVATE_KEY`: 填入 JSON 中的 `private_key` (整串複製，包含 `\n` Vercel 會自動處理)。
   - `GOOGLE_CALENDAR_ID`: 填入你的日曆 ID (如果用個人日曆，就是你的 Gmail 地址)。

## 🛠️ 本地開發

```bash
npm install
npm run dev
```

注意：本地開發時，若要測試 API 功能，需在專案根目錄建立 `.env.local` 檔案並填入上述變數。
