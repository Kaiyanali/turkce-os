'use client';

const variants: Record<string, string> = {
  amber: 'bg-amber/20 text-amber',
  teal: 'bg-teal/20 text-teal-light',
  green: 'bg-green-500/20 text-green-400',
  red: 'bg-red-500/20 text-red-400',
  gray: 'bg-gray-500/20 text-gray-400',
  purple: 'bg-purple-500/20 text-purple-400',
};

interface BadgeProps {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'amber',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.gray} ${className}`}
    >
      {children}
    </span>
  );
}
