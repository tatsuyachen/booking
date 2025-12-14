import React, { useState, FormEvent, useEffect } from 'react';
import { Input, Select, Checkbox, Textarea } from './ui/FormElements';
import { submitBooking } from '../services/bookingService';
import { BookingData, BookingStatus } from '../types';

const BookingForm: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    date: today,
    time: '',
    duration: '1',
    topics: [],
    otherTopic: ''
  });

  const [status, setStatus] = useState<BookingStatus>(BookingStatus.IDLE);
  const [resultMsg, setResultMsg] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return { ...prev, topics: [...prev.topics, value] };
      } else {
        return { ...prev, topics: prev.topics.filter(t => t !== value) };
      }
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(BookingStatus.SUBMITTING);
    setResultMsg('');

    try {
      const response = await submitBooking(formData);
      
      if (response.success) {
        setStatus(BookingStatus.SUCCESS);
        setResultMsg(response.message);
        // Reset form but keep date as today
        setFormData({
            name: '',
            date: today,
            time: '',
            duration: '1',
            topics: [],
            otherTopic: ''
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

  // Safe HTML rendering for the message box (handling <br>)
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
        ]}
      />

      <div className="mb-6">
        <label className="block mb-3 text-base font-bold text-text-heading">討論主題 (可複選)</label>
        <div className="flex flex-col gap-3">
          {['商務會談', '私誼敘舊', '親屬約會'].map((topic) => (
            <Checkbox
              key={topic}
              label={topic}
              name="topics"
              value={topic}
              checked={formData.topics.includes(topic)}
              onChange={handleCheckboxChange}
            />
          ))}
        </div>
      </div>

      <Textarea
        id="otherTopic"
        name="otherTopic"
        label="其他主題 / 備註事項"
        rows={3}
        placeholder="如果有其他主題或細節，請在此說明..."
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
          className={`mt-6 p-4 rounded-xl text-base font-medium leading-relaxed border-2 animate-fadeIn
            ${status === BookingStatus.SUCCESS 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200'
            }`}
        >
           <div dangerouslySetInnerHTML={createMarkup(resultMsg)} />
        </div>
      )}
    </form>
  );
};

export default BookingForm;