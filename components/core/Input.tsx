import { cn } from "@/lib/utils";

type InputProps = {
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "email";
  disabled?: boolean;
  className?: string;
  label?: string;
};

export default function Input({ 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  disabled = false,
  className,
  label
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "disabled:bg-gray-50 disabled:text-gray-500",
          className
        )}
      />
    </div>
  );
}
