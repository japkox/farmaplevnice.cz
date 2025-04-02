import { DivideIcon as LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: typeof LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm ">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && (
        <div className="mt-6 flex justify-center">
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}