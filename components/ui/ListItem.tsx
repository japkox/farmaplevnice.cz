import { ReactNode } from 'react';

interface ListItemProps {
    children: ReactNode;
    className?: string;
  };
  
  export function ListItem ({ children, className = '' }: ListItemProps) {
    return <li className={`marker:text-gray-400 ${className}`}>{children}</li>;
  };