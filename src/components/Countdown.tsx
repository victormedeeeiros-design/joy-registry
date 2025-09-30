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
        <h3 className="text-2xl md:text-3xl font-sloop text-primary mb-2 tracking-wide">
          CONTAGEM REGRESSIVA
        </h3>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 max-w-4xl mx-auto">
        {timeUnits.map((unit, index) => (
          <div key={unit.key} className="flex-1 min-w-[80px] max-w-[140px]">
            <Card className="bg-white border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {unit.value.toString().padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm font-semibold text-primary/70 tracking-widest uppercase">
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