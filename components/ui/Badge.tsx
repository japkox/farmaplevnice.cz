import {ReactNode} from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  const variantStyles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}