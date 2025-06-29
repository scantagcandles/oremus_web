import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { GlassInput } from './GlassInput';
import { GlassCard } from './GlassCard';
import { AnimatePresence, motion } from 'framer-motion';

interface DatePickerProps {
  value?: string;
  onChange: (date: Date) => void;
  error?: string;
  min?: string;
  max?: string;
}

export function DatePicker({ value, onChange, error, min, max }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(date);
    setShowCalendar(false);
  };

  const weeks = [];
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  let day = 1;
  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        week.push(null);
      } else if (day <= daysInMonth) {
        week.push(new Date(year, month, day++));
      } else {
        week.push(null);
      }
    }
    if (week.some((d) => d !== null)) {
      weeks.push(week);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <GlassInput
          type="text"
          value={selectedDate ? selectedDate.toLocaleDateString() : ''}
          onClick={() => setShowCalendar(true)}
          readOnly
          placeholder="Wybierz datę"
          error={error}
          suffix={<Calendar className="w-5 h-5 text-white/50" />}
        />
      </div>

      <AnimatePresence>
        {showCalendar && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setShowCalendar(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 z-40"
            >
              <GlassCard className="p-4 min-w-[280px]">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month - 1))}
                    className="p-2 text-white/70 hover:text-white"
                  >
                    &lt;
                  </button>
                  <div className="text-white font-medium">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </div>
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month + 1))}
                    className="p-2 text-white/70 hover:text-white"
                  >
                    &gt;
                  </button>
                </div>

                {/* Days of the week */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'].map((day) => (
                    <div key={day} className="text-center text-white/50 text-sm">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {weeks.map((week, i) =>
                    week.map((date, j) => {
                      if (!date) {
                        return <div key={`empty-${i}-${j}`} />;
                      }

                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = new Date().toDateString() === date.toDateString();
                      const isDisabled = (min && date < new Date(min)) || (max && date > new Date(max));

                      return (
                        <button
                          key={date.toString()}
                          onClick={() => !isDisabled && handleDateSelect(date)}
                          disabled={isDisabled}
                          className={`
                            p-2 rounded-lg text-sm
                            ${isSelected ? 'bg-yellow-500 text-black' : 'hover:bg-white/10'}
                            ${isToday && !isSelected ? 'text-yellow-500' : 'text-white'}
                            ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
