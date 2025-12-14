export interface BookingData {
  name: string;
  date: string;
  time: string;
  duration: string;
  topic: string; // Changed from string[] to string for single selection
  otherTopic: string;
  location: string; // New field
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export enum BookingStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}