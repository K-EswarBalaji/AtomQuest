import React from 'react';
import { Loader } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-700 dark:via-blue-600 dark:to-cyan-600 text-white hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 dark:hover:from-blue-800 dark:hover:via-blue-700 dark:hover:to-cyan-700 focus:ring-blue-500 shadow-blue-500/30 hover:shadow-blue-500/50',
    secondary: 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-white hover:from-slate-300 hover:to-slate-400 dark:hover:from-slate-600 dark:hover:to-slate-500 focus:ring-slate-400 dark:focus:ring-slate-600',
    danger: 'bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 dark:from-red-700 dark:via-rose-600 dark:to-pink-600 text-white hover:from-red-700 hover:via-rose-600 hover:to-pink-600 dark:hover:from-red-800 dark:hover:via-rose-700 dark:hover:to-pink-700 focus:ring-red-500 shadow-red-500/30 hover:shadow-red-500/50',
    success: 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 dark:from-green-700 dark:via-emerald-600 dark:to-teal-600 text-white hover:from-green-700 hover:via-emerald-600 hover:to-teal-600 dark:hover:from-green-800 dark:hover:via-emerald-700 dark:hover:to-teal-700 focus:ring-green-500 shadow-green-500/30 hover:shadow-green-500/50'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className || ''}
      `}
    >
      {isLoading ? (
        <>
          <Loader size={18} className="animate-spin" />
          Loading...
        </>
      ) : children}
    </button>
  );
};

export default Button;
