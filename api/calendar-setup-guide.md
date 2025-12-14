# 如何將此應用程式串接 Google Calendar

由於這是一個純前端的 React 應用，為了安全起見（避免洩漏 API Key），串接 Google Calendar **必須** 透過後端 API 執行。由於你將部署在 Vercel，我們可以使用 Vercel Serverless Functions。

以下是完整步驟：

## 步驟 1: 設定 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)。
2. 建立一個新專案。
3. 搜尋並啟用 **Google Calendar API**。
4. 前往「Credentials (憑證)」 -> 「Create Credentials」 -> 「Service Account (服務帳戶)」。
5. 建立後，點擊該服務帳戶 -> 「Keys (金鑰)」 -> 「Add Key」 -> 「Create new key」 -> 選擇 **JSON**。
6. 下載該 JSON 檔案，這包含了你的私鑰。
7. **重要：** 開啟該 JSON 檔案，找到 `client_email` 欄位（例如 `service-account@project.iam.gserviceaccount.com`）。
8. 前往你的 **Google Calendar (個人行事曆)** -> 設定 -> 「共用此日曆」。
9. 將剛剛的 email 加入，並給予 **「變更活動」** 或 **「管理共用設定」** 的權限。

## 步驟 2: 安裝後端套件

在你的專案根目錄安裝 `googleapis`：

```bash
npm install googleapis
```

## 步驟 3: 建立 Vercel API Route

在你的專案根目錄建立一個 `api` 資料夾，並建立 `book.ts` (或 `book.js`)。

*(注意：如果你使用 Create React App 或 Vite，Vercel 會自動將 `api/` 資料夾內的檔案視為 Serverless Function)*

**api/book.ts 範例程式碼：**

```typescript
import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 從環境變數讀取憑證 (不要直接寫在程式碼裡！)
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const calendarId = process.env.GOOGLE_CALENDAR_ID; // 你的 email 或日曆 ID

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, date, time, duration, topics, otherTopic } = req.body;

  try {
    // 1. 驗證與設定 Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // 2. 計算結束時間
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + parseFloat(duration) * 60 * 60 * 1000);

    // 3. 寫入行事曆
    const event = {
      summary: `預約：${name} - ${topics.join(', ')}`,
      description: `主題：${topics.join(', ')}\n備註：${otherTopic}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Taipei', // 依據你的時區設定
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Taipei',
      },
    };

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    return res.status(200).json({ success: true, link: response.data.htmlLink });

  } catch (error: any) {
    console.error('Calendar API Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
```

## 步驟 4: 修改前端 service

修改 `services/bookingService.ts`，將原本的模擬程式碼改為呼叫剛剛建立的 API：

```typescript
export const submitBooking = async (data: BookingData): Promise<ApiResponse> => {
  const response = await fetch('/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  if (!response.ok) {
     throw new Error(result.message || 'Booking failed');
  }
  
  return { success: true, message: '預約成功！' };
};
```

## 步驟 5: Vercel 環境變數設定

在部署到 Vercel 時，請在 Vercel Dashboard 的 Settings -> Environment Variables 加入以下變數（內容來自步驟 1 下載的 JSON）：

1. `GOOGLE_CLIENT_EMAIL`: 服務帳戶的 email。
2. `GOOGLE_PRIVATE_KEY`: 私鑰內容（包含 `-----BEGIN PRIVATE KEY...`）。
3. `GOOGLE_CALENDAR_ID`: 通常是你的 Gmail 信箱地址。
