import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Zap, Target, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export function StatsCard({ 
  title, 
  value, 
  trend, 
  icon, 
  description, 
  className,
  variant = 'default',
  size = 'md'
}: StatsCardProps) {
  const variantStyles = {
    default: 'border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent',
    success: 'border-success/30 bg-gradient-to-br from-success/5 via-success/3 to-transparent',
    warning: 'border-warning/30 bg-gradient-to-br from-warning/5 via-warning/3 to-transparent',
    danger: 'border-destructive/30 bg-gradient-to-br from-destructive/5 via-destructive/3 to-transparent',
    info: 'border-info/30 bg-gradient-to-br from-info/5 via-info/3 to-transparent'
  };

  const iconColors = {
    default: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
    success: 'bg-gradient-to-br from-success to-success/80 text-success-foreground',
    warning: 'bg-gradient-to-br from-warning to-warning/80 text-warning-foreground',
    danger: 'bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground',
    info: 'bg-gradient-to-br from-info to-info/80 text-info-foreground'
  };

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const getTrendColor = () => {
    if (trend === undefined) return 'text-muted-foreground';
    if (trend > 0) return 'text-success';
    if (trend < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === undefined) return <Minus className="h-3 w-3" />;
    if (trend > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'success': return <Target className="h-5 w-5" />;
      case 'warning': return <Zap className="h-5 w-5" />;
      case 'danger': return <BarChart3 className="h-5 w-5" />;
      case 'info': return <DollarSign className="h-5 w-5" />;
      default: return <TrendingUp className="h-5 w-5" />;
    }
  };

  return (
    <Card className={cn(
      "card-hover-effect border-2 overflow-hidden relative",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {/* Effet de brillance */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 hover:opacity-5 transition-opacity duration-500",
        variant === 'default' ? 'via-primary' : 
        variant === 'success' ? 'via-success' : 
        variant === 'warning' ? 'via-warning' : 
        variant === 'danger' ? 'via-destructive' : 'via-info'
      )}></div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            variant === 'default' ? 'bg-primary' : 
            variant === 'success' ? 'bg-success' : 
            variant === 'warning' ? 'bg-warning' : 
            variant === 'danger' ? 'bg-destructive' : 'bg-info'
          )}></div>
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
            iconColors[variant]
          )}>
            {icon}
          </div>
        )}
        {!icon && (
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
            iconColors[variant]
          )}>
            {getDefaultIcon()}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 relative z-10">
        <div className={cn(
          "font-bold text-foreground",
          size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : 'text-3xl'
        )}>
          {value}
        </div>
        
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-2 text-sm font-semibold",
            getTrendColor()
          )}>
            {getTrendIcon()}
            <span>
              {trend > 0 ? '+' : ''}{trend.toFixed(2)}%
            </span>
          </div>
        )}
        
        {description && (
          <p className="text-xs text-muted-foreground font-medium">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
