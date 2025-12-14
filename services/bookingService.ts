import { BookingData, ApiResponse } from '../types';

/**
 * Sends booking data to the Vercel serverless function (/api/book).
 */
export const submitBooking = async (data: BookingData): Promise<ApiResponse> => {
  console.log('Sending data to API:', data);

  try {
    const response = await fetch('/api/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle server errors (e.g., missing keys, 500 error)
      throw new Error(result.message || `Server error: ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.message || 'Booking failed');
    }

    // Construct a friendly success message
    let fullTopicStr = data.topics.join(', ');
    if (data.otherTopic) {
      fullTopicStr += (fullTopicStr ? '、' : '') + data.otherTopic;
    }
    if (!fullTopicStr) fullTopicStr = '未填寫主題';

    return {
      success: true,
      message: `✅ 預約成功！<br>已同步至 Google 行事曆。<br>時間：${data.date} ${data.time}<br>主題：${fullTopicStr}`
    };

  } catch (error: any) {
    console.error('Booking Submission Error:', error);
    
    // Provide a helpful error message to the user
    let errorMessage = '網路發生錯誤，請稍後再試。';
    
    if (error.message.includes('Missing Google credentials')) {
      errorMessage = '⚠️ 系統設定錯誤：尚未設定 Google Calendar API 金鑰。<br>請聯絡管理員檢查 Vercel 環境變數。';
    } else {
      errorMessage = `⚠️ 預約失敗：${error.message}`;
    }

    return {
      success: false,
      message: errorMessage
    };
  }
};