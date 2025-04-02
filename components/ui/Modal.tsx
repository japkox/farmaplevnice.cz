import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <Button
              variant="secondary"
              onClick={onClose}
              icon={<X className="h-6 w-6" />}
              className="p-1"
            />
          </div>

          <div className="mb-6">
            {children}
          </div>

          {footer && (
            <div className="flex justify-end gap-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}