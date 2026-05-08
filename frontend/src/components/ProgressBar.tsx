export interface ProgressBarProps {
  percent: number;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ percent, size = 'sm' }: ProgressBarProps) {
  const heightClass = size === 'sm' ? 'h-2' : 'h-3';

  return (
    <div className={`w-full bg-gray-100 rounded-full ${heightClass}`}>
      <div
        className={`bg-primary-500 ${heightClass} rounded-full transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
