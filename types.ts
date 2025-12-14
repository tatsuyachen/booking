export interface BookingData {
  name: string;
  date: string;
  time: string;
  duration: string;
  topics: string[];
  otherTopic: string;
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