import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className,
  id,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputId = id || props.name;
  const isPasswordType = type === 'password';
  const displayType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={displayType}
          className={`
            w-full px-4 py-3 border-2 rounded-lg 
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white
            ${error 
              ? 'border-red-400 dark:border-red-500 focus:ring-red-500' 
              : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-400 dark:focus:ring-blue-500'
            }
            ${className || ''}
          `}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
