import { useDrag } from "@hooks/useDrag";
import React, { useState, useRef } from "react";

type TimeSlotSelectorProps = {
  selectedDates: string[];
  startTime: number;
  endTime: number;
};
export default function TimeSlotSelector({
  selectedDates,
  startTime,
  endTime,
}: Readonly<TimeSlotSelectorProps>) {
  const SLOT_DURATION = 30;
  const SLOTS_PER_HOUR = 60 / SLOT_DURATION;
  const HOUR_CNT = endTime - startTime;
  const TOTAL_SLOTS = HOUR_CNT * SLOTS_PER_HOUR; // row cnt
  const TOTAL_DATES = selectedDates.length; // column cnt

  const [selectedSlots, setSelectedSlots] = useState<boolean[][]>(
    Array.from({ length: TOTAL_SLOTS }, () =>
      Array.from({ length: TOTAL_DATES }, () => false)
    )
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateSlot = (index: number) => {
    // console.log("updateSlot", index);
    const row = Math.floor(index / TOTAL_DATES);
    const col = index % TOTAL_DATES;
    setSelectedSlots((slots) => {
      const newSlots = [...slots];
      newSlots[row][col] = !newSlots[row][col];
      return newSlots;
    });
  };

  const { handleStart, handleMove, handleEnd, handleTouchMove } = useDrag(
    updateSlot,
    TOTAL_SLOTS,
    TOTAL_DATES
  );

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateRows: `repeat(${TOTAL_SLOTS}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${TOTAL_DATES}, minmax(0, 1fr))`,
      }}
      ref={containerRef}
    >
      {Array.from({ length: TOTAL_SLOTS }, (_, slotIndex) => (
        <React.Fragment key={slotIndex}>
          {Array.from({ length: TOTAL_DATES }, (_, dateIndex) => {
            const index = slotIndex * TOTAL_DATES + dateIndex;
            const hour = startTime + Math.floor(slotIndex / SLOTS_PER_HOUR);
            const minute = (slotIndex % SLOTS_PER_HOUR) * SLOT_DURATION;

            return (
              <div
                key={dateIndex}
                className={`p-4 border ${
                  selectedSlots[slotIndex][dateIndex]
                    ? "bg-blue-500"
                    : "bg-white"
                } cursor-pointer`}
                onMouseDown={() => handleStart(index)}
                onMouseEnter={() => handleMove(index)}
                onMouseUp={handleEnd}
                onTouchMove={(e) => handleTouchMove(e, containerRef)}
              >
                {hour}:{minute < 10 ? `0${minute}` : minute}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
