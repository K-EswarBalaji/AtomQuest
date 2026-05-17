import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const variantClasses = {
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    default: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
  };

  return (
    <span className={`
      inline-block px-3 py-1 text-xs font-semibold rounded-full
      ${variantClasses[variant]}
      ${className || ''}
    `}>
      {children}
    </span>
  );
};

export default Badge;
