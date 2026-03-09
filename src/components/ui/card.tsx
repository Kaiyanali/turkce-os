'use client';

import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({
  hover = false,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-surface rounded-xl border border-white/5 p-5 ${
        hover ? 'hover:border-amber/20 hover:bg-surface-light transition-colors cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
