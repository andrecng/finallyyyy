import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthsCardProps {
  className?: string;
  currentMonth?: number;
}

export function MonthsCard({ className, currentMonth }: MonthsCardProps) {
  const months = [
    { name: 'Janvier', number: 1, short: 'Jan' },
    { name: 'Février', number: 2, short: 'Fév' },
    { name: 'Mars', number: 3, short: 'Mar' },
    { name: 'Avril', number: 4, short: 'Avr' },
    { name: 'Mai', number: 5, short: 'Mai' },
    { name: 'Juin', number: 6, short: 'Juin' },
    { name: 'Juillet', number: 7, short: 'Juil' },
    { name: 'Août', number: 8, short: 'Août' },
    { name: 'Septembre', number: 9, short: 'Sep' },
    { name: 'Octobre', number: 10, short: 'Oct' },
    { name: 'Novembre', number: 11, short: 'Nov' },
    { name: 'Décembre', number: 12, short: 'Déc' }
  ];
  
  const currentMonthNumber = currentMonth || new Date().getMonth() + 1;

  return (
    <Card className={cn("card-hover-effect border-2 border-info/30 bg-gradient-to-br from-info/5 via-info/3 to-transparent overflow-hidden relative", className)}>
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-info/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center gap-4 text-xl text-foreground">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-info to-info/80 flex items-center justify-center shadow-lg">
            <Calendar className="h-6 w-6 text-info-foreground" />
          </div>
          <div>
            <div className="text-lg font-bold">Mois de l'année</div>
            <div className="text-sm text-muted-foreground font-normal">Suivi temporel des simulations</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {months.map((month) => {
            const isCurrentMonth = month.number === currentMonthNumber;
            const isPastMonth = month.number < currentMonthNumber;
            const isFutureMonth = month.number > currentMonthNumber;
            
            let variant: "default" | "secondary" | "outline" = "outline";
            let className = "";
            
            if (isCurrentMonth) {
              variant = "default";
              className = "bg-gradient-to-r from-info to-info/80 text-info-foreground border-info shadow-lg scale-105";
            } else if (isPastMonth) {
              variant = "secondary";
              className = "bg-success/20 text-success border-success/30 hover:bg-success/30";
            } else {
              variant = "outline";
              className = "bg-card/50 text-muted-foreground border-border/50 hover:bg-card hover:text-foreground";
            }
            
            return (
              <Badge
                key={month.number}
                variant={variant}
                className={cn(
                  "justify-center py-3 px-4 text-xs font-semibold transition-all duration-200 cursor-pointer",
                  "hover:scale-105 hover:shadow-md border-2",
                  className
                )}
              >
                <span className="hidden sm:inline">{month.name}</span>
                <span className="sm:hidden">{month.short}</span>
              </Badge>
            );
          })}
        </div>
        
        {/* Légende */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-info"></div>
            <span className="text-foreground font-medium">Mois actuel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success"></div>
            <span className="text-muted-foreground">Mois passés</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-border"></div>
            <span className="text-muted-foreground">Mois futurs</span>
          </div>
        </div>
        
        {/* Indicateur de progression */}
        <div className="mt-4 p-3 bg-card/50 rounded-lg border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Progression annuelle</span>
            <span className="text-xs font-bold text-foreground">
              {Math.round((currentMonthNumber / 12) * 100)}%
            </span>
          </div>
          <div className="w-full bg-card rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-info to-info/80 transition-all duration-500"
              style={{ width: `${(currentMonthNumber / 12) * 100}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Mois {currentMonthNumber} sur 12</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
