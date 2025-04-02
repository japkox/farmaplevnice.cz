import { ReactNode } from 'react';

interface ListProps {
  children: ReactNode;
  className?: string;
};

export function List ({ children, className = '' }: ListProps) {
  return (
    <ul className={`list-disc pl-6 space-y-1 text-gray-700 ${className}`}>
      {children}
    </ul>
  );
};