import { BookingData, ApiResponse } from '../types';

export const submitBooking = async (data: BookingData): Promise<ApiResponse> => {
  try {
    const response = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Server error: ${response.status}`);
    }

    let fullTopicStr = data.topic;
    if (data.otherTopic) fullTopicStr += ` (${data.otherTopic})`;
    let locationStr = data.location ? `<br>地點：${data.location}` : '';

    return {
      success: true,
      message: `📅 <b>預約申請已送出！</b><br>我已收到您的預約資訊，將於 24 小時內確認。<br><br><b>預約詳情：</b><br>時間：${data.date} ${data.time}<br>主題：${fullTopicStr}${locationStr}<br><br>請靜候確認通知，謝謝！`
    };

  } catch (error: any) {
    console.error('Booking Submission Error:', error);
    return {
      success: false,
      message: error.message.includes('已有其他行程') ? error.message : `⚠️ 預約失敗：${error.message}`
    };
  }
};