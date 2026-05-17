import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'gradient';
}

const Card: React.FC<CardProps> = ({ title, children, className, footer, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl transition-all duration-300',
    elevated: 'bg-white dark:bg-slate-800 shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-slate-700'
  };

  return (
    <div className={`rounded-xl overflow-hidden ${variantClasses[variant]} ${className || ''}`}>
      {title && (
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
