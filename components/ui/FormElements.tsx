import React from 'react';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block mb-3 text-base font-bold text-text-heading">
      {label}
    </label>
    <input
      id={id}
      className={`w-full px-4 py-3.5 border-2 border-yellow-200 rounded-xl text-base bg-[#fffbef] text-text-main transition-all duration-200 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20 ${className}`}
      {...props}
    />
  </div>
);

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}
export const Select: React.FC<SelectProps> = ({ label, id, options, ...props }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block mb-3 text-base font-bold text-text-heading">
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        className="w-full px-4 py-3.5 border-2 border-yellow-200 rounded-xl text-base bg-[#fffbef] text-text-main transition-all duration-200 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-heading">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>
);

// Checkbox Component
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => (
  <label className="flex items-center cursor-pointer group select-none">
    <div className="relative">
      <input
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <div className="w-6 h-6 border-2 border-yellow-200 rounded-md bg-white peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center">
        <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <span className="ml-3 text-text-main group-hover:text-text-heading transition-colors">{label}</span>
  </label>
);

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
export const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block mb-3 text-base font-bold text-text-heading">
      {label}
    </label>
    <textarea
      id={id}
      className="w-full px-4 py-3.5 border-2 border-yellow-200 rounded-xl text-base bg-[#fffbef] text-text-main transition-all duration-200 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20 min-h-[100px] resize-y"
      {...props}
    />
  </div>
);
