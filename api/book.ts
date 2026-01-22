import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 1. Environment Variables
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const resendApiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.NOTIFICATION_EMAIL;

  const { name, date, time, duration, topic, otherTopic, location } = req.body;

  try {
    // Basic validation
    if (!name || !date || !time) throw new Error('Missing required fields');

    // Handle Private Key
    let safePrivateKey = (privateKey as string).replace(/\\n/g, '\n');
    if (safePrivateKey.startsWith('"') && safePrivateKey.endsWith('"')) {
      safePrivateKey = safePrivateKey.slice(1, -1);
    }

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: safePrivateKey },
      scopes: SCOPES,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Calculate times
    const startDateTime = new Date(`${date}T${time}:00+08:00`);
    const endDateTime = new Date(startDateTime.getTime() + parseFloat(duration) * 60 * 60 * 1000);

    // Conflict Check
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
    
    // Insert Event to Owner's Calendar
    const event = {
      summary: `預約：${name} - ${topic}`,
      description: `預約人：${name}\n主題：${finalTopic}\n地點：${location || '未指定'}\n備註：${otherTopic || '無'}`,
      location: location || '',
      start: { dateTime: startDateTime.toISOString(), timeZone: 'Asia/Taipei' },
      end: { dateTime: endDateTime.toISOString(), timeZone: 'Asia/Taipei' },
    };

    await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    // Construct a Google Calendar Template URL for the Guest
    // Format: https://www.google.com/calendar/render?action=TEMPLATE&text=TITLE&details=DESC&location=LOC&dates=START/END
    const formatForUrl = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const guestCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`約會：${finalTopic}`)}&details=${encodeURIComponent(`與 ${process.env.OWNER_NAME || '我'} 的約會\n備註：${otherTopic || '無'}`)}&location=${encodeURIComponent(location || '')}&dates=${formatForUrl(startDateTime)}/${formatForUrl(endDateTime)}`;

    // --- Send Email Notification via Resend (To Owner) ---
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
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #7c2d12;">收到一則新的預約</h2>
                <p><strong>預約人：</strong> ${name}</p>
                <p><strong>日期：</strong> ${date}</p>
                <p><strong>時間：</strong> ${time} (${duration} 小時)</p>
                <p><strong>討論主題：</strong> ${finalTopic}</p>
                <p><strong>預約地點：</strong> ${location || '未提供'}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9rem; color: #666;">行程已自動同步至您的 Google 行事曆。</p>
              </div>
            `
          })
        });
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Booking completed',
      googleCalendarUrl: guestCalendarUrl
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}