// Import React to fix namespace errors for React.FC and React.ChangeEvent
import React, { useState, FormEvent } from 'react';
import { Input, Select, Radio, Textarea } from './ui/FormElements';
import { submitBooking } from '../services/bookingService';
import { BookingData, BookingStatus } from '../types';

// Use React.FC as a functional component type
const BookingForm: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    date: today,
    time: '',
    duration: '1',
    topic: '商務會談', // Default value
    otherTopic: '',
    location: ''
  });

  const [status, setStatus] = useState<BookingStatus>(BookingStatus.IDLE);
  const [resultMsg, setResultMsg] = useState<string>('');
  const [calendarUrl, setCalendarUrl] = useState<string>(''); // Store the add-to-calendar URL
  const [isLocating, setIsLocating] = useState(false);

  // Use React.ChangeEvent for input events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Use React.ChangeEvent for radio button changes
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, topic: e.target.value }));
  };

  // Geolocation Logic
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("您的瀏覽器不支援定位功能");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Construct a Google Maps link
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, location: mapsLink }));
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("無法取得位置，請確認您已允許瀏覽器存取位置資訊。");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(BookingStatus.SUBMITTING);
    setResultMsg('');
    setCalendarUrl('');

    try {
      const response = await submitBooking(formData);
      
      if (response.success) {
        setStatus(BookingStatus.SUCCESS);
        setResultMsg(response.message);
        if (response.googleCalendarUrl) {
          setCalendarUrl(response.googleCalendarUrl);
        }
        
        // Reset form but keep date as today and topic default
        setFormData({
            name: '',
            date: today,
            time: '',
            duration: '1',
            topic: '商務會談',
            otherTopic: '',
            location: ''
        });
      } else {
        setStatus(BookingStatus.ERROR);
        setResultMsg(response.message);
      }
    } catch (error) {
      setStatus(BookingStatus.ERROR);
      setResultMsg("網路發生錯誤，請稍後再試。");
    }
  };

  // Safe HTML rendering for the message box
  const createMarkup = (html: string) => {
    return { __html: html };
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Input
        id="name"
        name="name"
        label="您的姓名 / 稱呼"
        type="text"
        placeholder="例如：王小明"
        required
        value={formData.name}
        onChange={handleInputChange}
      />

      <Input
        id="date"
        name="date"
        label="預約日期"
        type="date"
        min={today}
        required
        value={formData.date}
        onChange={handleInputChange}
      />

      <Input
        id="location"
        name="location"
        label="預約地點"
        type="text"
        placeholder="輸入地點或點擊按鈕取得定位"
        value={formData.location}
        onChange={handleInputChange}
        rightElement={
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title="自動填入目前位置連結"
          >
            {isLocating ? (
               <span className="animate-spin">↻</span>
            ) : (
               <span>📍</span>
            )}
            <span className="hidden sm:inline">{isLocating ? '定位中...' : '使用目前位置'}</span>
          </button>
        }
      />

      <Input
        id="time"
        name="time"
        label="預約時間"
        type="time"
        required
        value={formData.time}
        onChange={handleInputChange}
      />

      <Select
        id="duration"
        name="duration"
        label="預計時長"
        value={formData.duration}
        onChange={handleInputChange}
        options={[
          { value: '0.5', label: '30 分鐘' },
          { value: '1', label: '1 小時' },
          { value: '2', label: '2 小時' },
          { value: '3', label: '3 小時' },
          { value: '4', label: '4 小時' },
        ]}
      />

      <div className="mb-6">
        <label className="block mb-3 text-base font-bold text-text-heading">討論主題 (單選)</label>
        <div className="flex flex-col gap-3">
          {['商務會談', '私誼敘舊', '親屬約會'].map((topicOption) => (
            <Radio
              key={topicOption}
              label={topicOption}
              name="topic" // Same name group ensuring mutual exclusion
              value={topicOption}
              checked={formData.topic === topicOption}
              onChange={handleTopicChange}
            />
          ))}
        </div>
      </div>

      <Textarea
        id="otherTopic"
        name="otherTopic"
        label="其他主題 / 備註事項"
        rows={3}
        placeholder="如果有其他主題 or 細節，請在此說明..."
        value={formData.otherTopic}
        onChange={handleInputChange}
      />

      <button
        type="submit"
        disabled={status === BookingStatus.SUBMITTING}
        className={`w-full py-4 px-6 mt-4 rounded-xl text-lg font-bold text-text-heading transition-all duration-200 transform shadow-[0_4px_6px_-1px_rgba(251,191,36,0.4)]
          ${status === BookingStatus.SUBMITTING 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
            : 'bg-primary hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_6px_8px_-1px_rgba(251,191,36,0.5)] active:translate-y-0 active:shadow-sm'
          }`}
      >
        {status === BookingStatus.SUBMITTING ? '系統處理中...' : '確認預約'}
      </button>

      {status !== BookingStatus.IDLE && status !== BookingStatus.SUBMITTING && (
        <div 
          className={`mt-6 p-4 rounded-xl text-base font-medium leading-relaxed border-2 animate-fadeIn flex flex-col gap-4
            ${status === BookingStatus.SUCCESS 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200'
            }`}
        >
           <div dangerouslySetInnerHTML={createMarkup(resultMsg)} />
           
           {status === BookingStatus.SUCCESS && calendarUrl && (
             <a 
               href={calendarUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="self-start inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
             >
               <span>📅</span>
               加入我的 Google 行事曆
             </a>
           )}
        </div>
      )}
    </form>
  );
};

export default BookingForm;