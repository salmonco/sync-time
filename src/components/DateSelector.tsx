import { useDrag } from "@hooks/useDrag";
import React, { useState, useEffect, useRef } from "react";

interface DateSelectorProps {
  selectedDates: string[];
  setSelectedDates: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function DateSelector({
  selectedDates,
  setSelectedDates,
}: Readonly<DateSelectorProps>) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [datesGrid, setDatesGrid] = useState<(Date | null)[][]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    generateDatesGrid(currentMonth);
  }, [currentMonth]);

  const generateDatesGrid = (date: Date) => {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = endDate.getDate();
    const firstDay = startDate.getDay();

    const grid: (Date | null)[][] = [];
    for (let i = 0; i < 6; i++) {
      const week: (Date | null)[] = [];
      for (let j = 0; j < 7; j++) {
        const day = i * 7 + j - firstDay + 1;
        if (day > 0 && day <= daysInMonth) {
          week.push(new Date(date.getFullYear(), date.getMonth(), day));
        } else {
          week.push(null);
        }
      }
      grid.push(week);
    }
    setDatesGrid(grid);
  };

  const toggleDateSelection = (date: Date) => {
    const dateString = date.toDateString();
    setSelectedDates((prevSelected) => {
      if (prevSelected.includes(dateString)) {
        return prevSelected.filter((d) => d !== dateString);
      } else {
        return [...prevSelected, dateString];
      }
    });
  };

  const updateSlot = (index: number) => {
    const row = Math.floor(index / 7); // 7열 기준으로 행 계산
    const col = index % 7; // 열 인덱스 계산
    const date = datesGrid[row][col]; // 해당 날짜 가져오기
    if (date) {
      toggleDateSelection(date);
    }
  };

  // useDrag 훅 사용
  const { handleStart, handleMove, handleEnd, handleTouchMove } = useDrag(
    updateSlot,
    6,
    7
  );

  const handleDrag = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getKoreanMonth = (month: number) => {
    const months = [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ];
    return months[month];
  };

  return (
    <div className="p-4">
      {/* 현재 월과 연도 표시 */}
      <div className="text-center font-bold mb-2 w-[280px]">
        {getKoreanMonth(currentMonth.getMonth())} {currentMonth.getFullYear()}
      </div>
      <div className="grid grid-cols-7 mb-2 w-[280px]">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 w-[280px]" ref={containerRef}>
        {datesGrid.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((date, dayIndex) => {
              const index = weekIndex * 7 + dayIndex; // 전체 인덱스 계산
              return (
                <div
                  key={dayIndex}
                  className={`flex items-center justify-center border ${
                    date && selectedDates.includes(date.toDateString())
                      ? "bg-green-500 text-white"
                      : "hover:bg-gray-200"
                  } cursor-pointer`}
                  onMouseDown={() => handleStart(index)}
                  onMouseEnter={() => handleMove(index)}
                  onMouseUp={handleEnd}
                  onTouchMove={(e) => handleTouchMove(e, containerRef)}
                  style={{ width: "40px", height: "40px" }} // 셀 크기 설정
                >
                  {date ? date.getDate() : ""}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between mt-4 w-[280px]">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => handleDrag("prev")}
        >
          이전 달
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => handleDrag("next")}
        >
          다음 달
        </button>
      </div>
    </div>
  );
}
