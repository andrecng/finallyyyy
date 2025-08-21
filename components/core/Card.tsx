import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

export default function Card({ children, className, padding = "md" }: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };
  
  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg shadow-sm",
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}
