import React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/dist/style.css';

const Calendar = ({
  className = '',
  classNames = {},
  showOutsideDays = true,
  ...props
}) => {
  const defaultClassNames = {
    months: 'flex flex-col space-y-4',
    month: 'space-y-4',
    caption: 'flex justify-center pt-1 relative items-center',
    caption_label: 'text-sm font-semibold text-gray-900',
    nav: 'space-x-1 flex items-center',
    nav_button:
      'h-8 w-8 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-primary-500 hover:text-primary-500 hover:bg-blue-50 cursor-pointer',
    nav_button_previous: 'absolute left-1',
    nav_button_next: 'absolute right-1',
    table: 'w-full border-collapse space-y-1',
    head_row: '',
    head_cell: 'text-gray-400 font-medium text-[0.75rem] uppercase',
    row: 'mt-2',
    cell: 'relative text-center text-sm focus-within:relative focus-within:z-20',
    day: 'inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-gray-900 transition hover:bg-blue-50 hover:text-primary-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/60',
    day_selected: 'bg-primary-500 text-white hover:bg-primary-500 hover:text-white focus:bg-primary-500 focus:text-white',
    day_today: 'bg-blue-100 text-primary-600 font-semibold',
    day_outside: 'text-gray-300 pointer-events-none opacity-40',
    day_disabled: 'text-gray-300 pointer-events-none opacity-40',
    day_range_middle: 'aria-selected:bg-blue-100 aria-selected:text-primary-600',
    day_hidden: 'invisible',
  };

  return (
    <div
      className={`inline-block w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`.trim()}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="w-full"
        classNames={{ ...defaultClassNames, ...classNames }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </div>
  );
};

export default Calendar;
