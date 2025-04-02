import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`p-6 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }: CardProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }: CardProps) {
  return (
    <div className={`p-6 bg-gray-50 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};