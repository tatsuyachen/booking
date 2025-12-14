import { BookingData, ApiResponse } from '../types';

/**
 * Simulates the backend API call.
 * In a real Vercel deployment, this would fetch('/api/book', { method: 'POST', body: ... })
 */
export const submitBooking = async (data: BookingData): Promise<ApiResponse> => {
  console.log('Preparing to send data:', data);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulation Logic: Fail if time is 12:00
  if (data.time === '12:00') {
    return {
      success: false,
      message: `⚠️ 預約失敗！<br> ${data.date} ${data.time} 這個時段已經有行程了，請選擇其他時間。`
    };
  }

  // Construct readable topic string for success message
  let fullTopicStr = data.topics.join(', ');
  if (data.otherTopic) {
    fullTopicStr += (fullTopicStr ? '、' : '') + data.otherTopic;
  }
  if (!fullTopicStr) fullTopicStr = '未填寫主題';

  return {
    success: true,
    message: `✅ 預約成功！<br>已為您安排：${data.date} ${data.time}<br>主題：${fullTopicStr}<br>確認信已寄出 (模擬)。`
  };
};