# My Scheduler - 線上預約系統

這是一個整合 Google Calendar 與 Email 通知的線上預約系統。

## 🚀 部署至 Vercel 步驟

### 1. 設定環境變數 (Environment Variables)

請在 Vercel Dashboard 設定以下變數：

| 變數名稱 | 來源 | 說明 |
|---|---|---|
| `GOOGLE_CLIENT_EMAIL` | Google Cloud | 服務帳戶 Email |
| `GOOGLE_PRIVATE_KEY` | Google Cloud | 服務帳戶 私鑰 |
| `GOOGLE_CALENDAR_ID` | Google Calendar | 您的日曆 ID (通常是 Gmail) |
| `RESEND_API_KEY` | [Resend](https://resend.com) | Email 發送 API Key |
| `NOTIFICATION_EMAIL` | 您的 Gmail | 接收通知的電子信箱 |

### 2. Google 行事曆設定
確保已將 `GOOGLE_CLIENT_EMAIL` 加入行事曆的「共用」名單中，並給予「變更活動」權限。

### 3. Email 通知說明
系統將透過 Resend 發送通知信。若您是第一次使用，Resend 預設只能發信給您註冊時的信箱。若要發給其他人，需在 Resend 進行域名驗證。