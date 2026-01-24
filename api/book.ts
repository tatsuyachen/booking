import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, date, time, duration, topic, otherTopic, location } = req.body;

  try {
    if (!name || !date || !time) throw new Error('Missing required fields');

    // --- Custom Availability Rules ---
    // JavaScript getDay(): 0 is Sunday, 6 is Saturday
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); 
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isWeekday = !isWeekend;
    const hour = parseInt(time.split(':')[0]);

    // Rule 1: 平日上午 12:00 之前不受理預約 (移除「主人」稱謂)
    if (isWeekday && hour < 12) {
      return res.status(403).json({
        success: false,
        message: `<b>預約未成功</b><br/>平日 12:00 之前為固定專注工作時間，恕不接受預約。請選擇下午或晚間時段。`
      });
    }

    // Rule 2: 平日晚間 10 點 (22:00) 之後不受理「商務會談」
    if (isWeekday && topic === '商務會談' && hour >= 22) {
      return res.status(403).json({
        success: false,
        message: `<b>預約未成功</b><br/>晚間 22:00 之後不開放商務討論。若為私人聚會請更換主題，或改約其他時間。`
      });
    }

    // Rule 3: 週末時間不受理「商務會談」
    if (isWeekend && topic === '商務會談') {
      return res.status(403).json({
        success: false,
        message: `<b>預約未成功</b><br/>週末為個人休憩時間，恕不處理商務事宜。建議改約平日下午。`
      });
    }

    // --- Calendar Integration Logic ---
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.NOTIFICATION_EMAIL;

    let safePrivateKey = (privateKey as string).replace(/\\n/g, '\n');
    if (safePrivateKey.startsWith('"') && safePrivateKey.endsWith('"')) {
      safePrivateKey = safePrivateKey.slice(1, -1);
    }

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: safePrivateKey },
      scopes: SCOPES,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const startDateTime = new Date(`${date}T${time}:00+08:00`);
    const endDateTime = new Date(startDateTime.getTime() + parseFloat(duration) * 60 * 60 * 1000);

    const conflictCheck = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      singleEvents: true,
    });

    const busyEvents = conflictCheck.data.items?.filter(event => event.transparency !== 'transparent');
    if (busyEvents && busyEvents.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: `<b>該時段已有行程安排。</b><br/>請選擇其他時間。` 
      });
    }

    const finalTopic = otherTopic ? `${topic} (${otherTopic})` : topic;
    const event = {
      summary: `預約：${name} - ${topic}`,
      description: `預約人：${name}\n主題：${finalTopic}\n地點：${location || '未指定'}\n備註：${otherTopic || '無'}`,
      location: location || '',
      start: { dateTime: startDateTime.toISOString(), timeZone: 'Asia/Taipei' },
      end: { dateTime: endDateTime.toISOString(), timeZone: 'Asia/Taipei' },
    };

    await calendar.events.insert({ calendarId: calendarId, requestBody: event });

    const formatForUrl = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const guestCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`約會：${finalTopic}`)}&details=${encodeURIComponent(`預約確認：與您有個約定\n備註：${otherTopic || '無'}`)}&location=${encodeURIComponent(location || '')}&dates=${formatForUrl(startDateTime)}/${formatForUrl(endDateTime)}`;

    if (resendApiKey && notificationEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: '預約系統 <onboarding@resend.dev>',
            to: notificationEmail,
            subject: `📅 新預約：${name} (${date})`,
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;"><h2>收到新預約</h2><p><strong>預約人：</strong> ${name}</p><p><strong>日期：</strong> ${date}</p><p><strong>時間：</strong> ${time}</p><p><strong>主題：</strong> ${finalTopic}</p><p><strong>地點：</strong> ${location || '未指定'}</p></div>`
          })
        });
      } catch (e) { console.error(e); }
    }

    return res.status(200).json({ success: true, message: 'Booking completed', googleCalendarUrl: guestCalendarUrl });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}