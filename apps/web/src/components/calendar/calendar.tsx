import { component$, useSignal, $ } from '@builder.io/qwik';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dataCache?: Record<string, any>;
  onMonthChange?: (year: number, month: number) => void;
}

export const Calendar = component$<CalendarProps>(({ 
  selectedDate, 
  onDateSelect, 
  dataCache = {},
  onMonthChange
}) => {
  const currentMonth = useSignal(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 前月の日付を追加
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false
      });
    }
    
    // 今月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true
      });
    }
    
    // 次月の日付を追加（42日になるまで）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const navigateMonth = $((direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth.value);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    currentMonth.value = newMonth;
    
    // 月が変わった時に一括データ取得をトリガー
    if (onMonthChange) {
      onMonthChange(newMonth.getFullYear(), newMonth.getMonth() + 1);
    }
  });

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date > today;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return null;
    
    // Convert to number in case it's a string
    const numScore = Number(score);
    
    if (numScore >= 85) return 'excellent'; // 緑
    if (numScore >= 70) return 'good';      // 青
    if (numScore >= 55) return 'fair';      // 黄
    return 'poor';                       // 赤
  };

  const days = getDaysInMonth(currentMonth.value);

  return (
    <div class="calendar">
      <div class="calendar-header">
        <button 
          onClick$={() => navigateMonth('prev')}
          class="nav-button"
        >
          ‹
        </button>
        <h3 class="month-title">
          {currentMonth.value.getFullYear()}年 {monthNames[currentMonth.value.getMonth()]}
        </h3>
        <button 
          onClick$={() => navigateMonth('next')}
          class="nav-button"
        >
          ›
        </button>
      </div>
      
      <div class="calendar-grid">
        <div class="day-names">
          {dayNames.map((dayName) => (
            <div key={dayName} class="day-name">
              {dayName}
            </div>
          ))}
        </div>
        
        <div class="days-grid">
          {days.map((dayInfo, index) => {
            const { date, isCurrentMonth } = dayInfo;
            const dateKey = date.toISOString().split('T')[0];
            const data = dataCache[dateKey];
            const dayHasData = !!data;
            const isFuture = isFutureDate(date);
            const dateScore = data?.readiness?.score ?? null;
            const scoreColor = getScoreColor(dateScore);
            
            
            return (
              <button
                key={index}
                class={`calendar-day ${
                  isCurrentMonth ? 'current-month' : 'other-month'
                } ${
                  isToday(date) ? 'today' : ''
                } ${
                  isSelected(date) ? 'selected' : ''
                } ${
                  dayHasData ? 'has-data' : ''
                } ${
                  isFuture ? 'future' : ''
                } ${
                  scoreColor ? `score-${scoreColor}` : ''
                }`}
                onClick$={() => !isFuture && onDateSelect(date)}
                disabled={isFuture}
                title={dateScore ? `Readiness Score: ${dateScore}` : undefined}
              >
                <span class="day-number">{date.getDate()}</span>
                {dayHasData && !scoreColor && <div class="data-indicator" />}
                {scoreColor && <div class="score-indicator" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});