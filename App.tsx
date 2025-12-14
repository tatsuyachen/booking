import React from 'react';
import BookingForm from './components/BookingForm';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex justify-center items-center p-5 bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] font-sans text-text-main">
      <div className="bg-card w-full max-w-[500px] p-10 rounded-[20px] border-2 border-[#fde68a] shadow-[0_20px_30px_-10px_rgba(251,191,36,0.2)]">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-[2.5rem] mx-auto mb-4 border-4 border-white shadow-[0_4px_10px_rgba(251,191,36,0.3)]">
            ✨
          </div>
          <h1 className="text-[1.75rem] font-extrabold mb-2 text-text-heading">
            預約我的時間
          </h1>
          <p className="text-text-sub text-base m-0">
            請填寫下方表單，將自動同步至行事曆。<br />
            <small className="text-sm opacity-80">(預覽模式：選 12:00 會模擬行程衝突)</small>
          </p>
        </div>

        {/* Form Section */}
        <BookingForm />

      </div>
    </div>
  );
};

export default App;