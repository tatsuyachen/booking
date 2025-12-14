import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Scopes required for the Google Calendar API
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 1. Secure Environment Variable Check
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!clientEmail || !privateKey || !calendarId) {
    console.error('Missing Google Calendar Environment Variables');
    return res.status(500).json({ 
      success: false, 
      message: 'Server Configuration Error: Missing Google credentials. Please set GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_CALENDAR_ID in Vercel settings.' 
    });
  }

  const { name, date, time, duration, topics, otherTopic } = req.body;

  if (!name || !date || !time) {
     return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // 2. Handle Private Key Formatting (Fixes common Vercel env var copy-paste issues)
    let safePrivateKey = privateKey;
    // Remove wrapping quotes if they exist
    if (safePrivateKey.startsWith('"') && safePrivateKey.endsWith('"')) {
        safePrivateKey = safePrivateKey.slice(1, -1);
    }
    // Convert literal \n characters (common in Vercel UI) to actual newlines
    safePrivateKey = safePrivateKey.replace(/\\n/g, '\n');

    // 3. Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: safePrivateKey,
      },
      scopes: SCOPES,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // 4. Calculate Event Time (Force Taipei Time +08:00)
    // We explicitly append +08:00 to the time string to ensure the date object is created in Taipei time,
    // regardless of the server's timezone (Vercel servers use UTC).
    const startDateTimeStr = `${date}T${time}:00+08:00`;
    const startDateTime = new Date(startDateTimeStr);
    
    if (isNaN(startDateTime.getTime())) {
        throw new Error('Invalid date/time format');
    }

    const durationHours = parseFloat(duration);
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

    // Format topics
    const topicsStr = topics && topics.length > 0 ? topics.join(', ') : '無特定主題';
    const description = `預約人：${name}\n討論主題：${topicsStr}\n備註：${otherTopic || '無'}`;

    // 5. Insert Event into Google Calendar
    const event = {
      summary: `[預約] ${name} - ${topicsStr}`,
      description: description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Taipei', 
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

    return res.status(200).json({ 
      success: true, 
      message: 'Event created successfully',
      link: response.data.htmlLink 
    });

  } catch (error: any) {
    console.error('Google Calendar API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Google Calendar API Error: ' + (error.message || 'Unknown error') 
    });
  }
}