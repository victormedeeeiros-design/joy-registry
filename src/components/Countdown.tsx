import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CountdownProps {
  targetDate: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Countdown = ({ targetDate, className = "" }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: 'DIAS', key: 'days' },
    { value: timeLeft.hours, label: 'HORAS', key: 'hours' },
    { value: timeLeft.minutes, label: 'MINUTOS', key: 'minutes' },
    { value: timeLeft.seconds, label: 'SEGUNDOS', key: 'seconds' }
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-script text-white mb-2 tracking-wide">
          CONTAGEM REGRESSIVA
        </h3>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-2xl mx-auto">
        {timeUnits.map((unit, index) => (
          <div key={unit.key} className="flex-1 min-w-[70px] max-w-[120px]">
            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-amber-800 to-amber-600 bg-clip-text text-transparent mb-1">
                  {unit.value.toString().padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm font-semibold text-amber-700 tracking-wide uppercase">
                  {unit.label}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};