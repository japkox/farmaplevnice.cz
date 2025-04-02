interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export function LoadingSpinner({ size = 'medium' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-16 w-16 border-4'
  };

  return (
    <div className="flex justify-center">
      <div className={`animate-spin rounded-full border-green-600 border-t-transparent ${sizeClasses[size]}`} />
    </div>
  );
}