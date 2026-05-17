import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  fullWidth = true,
  className,
  id,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-4 py-2 border rounded-lg 
          bg-white dark:bg-slate-800 text-slate-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500
          ${error ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'}
          transition-colors duration-200
          ${className || ''}
        `}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Select;
