import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  as?: 'input' | 'textarea';
  rows?: number;
}

export function Input({ 
  label, 
  error, 
  icon, 
  className = '', 
  as = 'input',
  rows = 3,
  ...props 
}: InputProps) {
  const baseInputClasses = "w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3";
  const heightClasses = "h-12";
  const iconClasses = icon ? 'pl-10' : '';
  const errorClasses = error ? 'border-red-300' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        {as === 'textarea' ? (
          <textarea
            className={`${baseInputClasses} ${errorClasses} ${className} resize-none px-3`}
            rows={rows}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            className={`${baseInputClasses} ${heightClasses} ${iconClasses} ${errorClasses} ${className}`}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}