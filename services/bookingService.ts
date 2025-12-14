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
      throw new Error(result.message || `Server error: ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.message || 'Booking failed');
    }

    // Construct a friendly success message
    let fullTopicStr = data.topic;
    if (data.otherTopic) {
      fullTopicStr += ` (${data.otherTopic})`;
    }
    
    let locationStr = data.location ? `<br>地點：${data.location}` : '';

    return {
      success: true,
      message: `✅ 預約成功！<br>已同步至 Google 行事曆。<br>時間：${data.date} ${data.time}<br>主題：${fullTopicStr}${locationStr}`
    };

  } catch (error: any) {
    console.error('Booking Submission Error:', error);
    
    let errorMessage = '網路發生錯誤，請稍後再試。';
    
    if (error.message.includes('Server Configuration Error')) {
      errorMessage = `⚠️ 系統設定錯誤：<br>${error.message}`;
    } else if (error.message.includes('Google Calendar API Error')) {
       errorMessage = `⚠️ Google API 錯誤：<br>${error.message}`;
    } else {
      errorMessage = `⚠️ 預約失敗：${error.message}`;
    }

    return {
      success: false,
      message: errorMessage
    };
  }
};