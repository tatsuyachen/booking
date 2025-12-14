import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Scopes required for the Google Calendar API
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // Check if environment variables are configured
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CALENDAR_ID) {
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

  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  try {
    // 1. Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Replace literal \n with actual newlines if stored in env vars incorrectly
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // 2. Calculate Start and End times
    const startDateTime = new Date(`${date}T${time}:00`);
    const durationHours = parseFloat(duration);
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

    // Format topics
    const topicsStr = topics && topics.length > 0 ? topics.join(', ') : '無特定主題';
    const description = `預約人：${name}\n討論主題：${topicsStr}\n備註：${otherTopic || '無'}`;

    // 3. Insert Event
    const event = {
      summary: `[預約] ${name} - ${topicsStr}`,
      description: description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Taipei', // Adjust timeZone if needed
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Taipei',
      },
    };

    // Check for conflicts (Optional enhancement: list events first)
    // For this simple version, we just insert. Google Calendar allows overlapping events by default
    // unless you check free/busy.
    
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