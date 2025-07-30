import React, { useState, useMemo } from 'react';

interface AvailabilitySlot {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  isFromICS?: boolean;
}

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
  onSlotClick?: (slot: AvailabilitySlot) => void;
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  slots,
  onSlotClick,
  onDateClick,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const daySlots = slots.filter(slot =>
        slot.start.toDateString() === date.toDateString()
      );

      days.push({
        date,
        day,
        slots: daySlots,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: selectedDate?.toDateString() === date.toDateString()
      });
    }

    return days;
  }, [currentMonth, slots, selectedDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          {formatMonthYear(currentMonth)}
        </h2>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarData.map((dayData, index) => (
          <div
            key={index}
            className={`min-h-[120px] border-r border-b border-gray-100 p-2 ${
              !dayData ? 'bg-gray-50' : 'bg-white hover:bg-gray-50 cursor-pointer'
            }`}
            onClick={() => dayData && handleDateClick(dayData.date)}
          >
            {dayData && (
              <>
                <div className={`text-sm font-medium mb-1 ${
                  dayData.isToday 
                    ? 'text-blue-600 font-bold' 
                    : dayData.isSelected 
                    ? 'text-blue-600' 
                    : 'text-gray-900'
                }`}>
                  {dayData.day}
                  {dayData.isToday && (
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mt-1">
                      {dayData.day}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {dayData.slots.slice(0, 3).map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick?.(slot);
                      }}
                      className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${
                        slot.isFromICS 
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                      title={`${slot.title} - ${slot.start.toLocaleTimeString()} to ${slot.end.toLocaleTimeString()}`}
                    >
                      {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {slot.title}
                    </div>
                  ))}

                  {dayData.slots.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayData.slots.length - 3} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span className="text-gray-600">From ICS File</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-gray-600">Manual Entry</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
