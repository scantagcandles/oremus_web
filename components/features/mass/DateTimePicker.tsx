import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { massOrderingService } from "@/services/massOrderingService";
import { Input } from "../glass/Input";
import { Button } from "../glass/Button";
import { motion } from "framer-motion";

interface DateTimePickerProps {
  churchId: string;
  value: {
    date: Date | null;
    time: string;
  };
  onComplete: (dateTime: { date: Date; time: string }) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  churchId,
  value,
  onComplete,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value.date);
  const [selectedTime, setSelectedTime] = useState(value.time);

  const { data: availableHours, isLoading } = useQuery({
    queryKey: ["availableHours", churchId, selectedDate],
    queryFn: () =>
      selectedDate
        ? massOrderingService.getAvailableHours({
            churchId,
            date: selectedDate,
          })
        : Promise.resolve([]),
    enabled: !!churchId && !!selectedDate,
  });

  const handleSubmit = () => {
    if (selectedDate && selectedTime) {
      onComplete({ date: selectedDate, time: selectedTime });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <Input
          type="date"
          label="Select Date"
          value={selectedDate?.toISOString().split("T")[0] || ""}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          min={new Date().toISOString().split("T")[0]}
          className="w-full"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Available Times
          </label>
          <div className="grid grid-cols-3 gap-2">
            {isLoading ? (
              <div className="col-span-3 flex justify-center py-4">
                <svg
                  className="animate-spin h-6 w-6 text-gold-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              availableHours?.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedDate || !selectedTime}
        className="w-full"
      >
        Continue
      </Button>
    </motion.div>
  );
};

export default DateTimePicker;
