import React, { useState } from "react";
import "../styles/components.css";

interface ScheduleCalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onTodayClick?: () => void;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  selectedDate,
  onDateChange,
  onTodayClick,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleDateClick = (day: number) => {
    onDateChange(
      `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateChange(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    );
    onTodayClick?.();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h3>{monthName}</h3>
        <button className="btn-secondary btn-sm" onClick={handleToday}>
          Today
        </button>
      </div>

      <div className="calendar-controls">
        <button className="btn-secondary btn-sm" onClick={handlePrevMonth}>
          ← Prev
        </button>
        <button className="btn-secondary btn-sm" onClick={handleNextMonth}>
          Next →
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>

        <div className="calendar-days">
          {days.map((day, index) => {
            const isCurrentDate =
              day &&
              selectedDate ===
                `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            return (
              <button
                key={index}
                className={`calendar-day ${day ? "" : "empty"} ${
                  isCurrentDate ? "selected" : ""
                }`}
                onClick={() => day && handleDateClick(day)}
                disabled={!day}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
