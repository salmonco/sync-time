import { useDrag } from "@hooks/useDrag";
import React, { useRef, Dispatch, SetStateAction } from "react";

interface TimeSlotSelectorProps {
  selectedSlots: boolean[][][];
  setSelectedSlots: Dispatch<SetStateAction<boolean[][][]>>;
  selectedDates: string[];
  startTime: number;
  endTime: number;
  SLOT_DURATION: number;
  SLOTS_PER_HOUR: number;
  TOTAL_SLOTS: number;
  selectedPlaceIdx: number;
}

export default function TimeSlotSelector({
  selectedSlots,
  setSelectedSlots,
  selectedDates,
  startTime,
  endTime,
  SLOT_DURATION,
  SLOTS_PER_HOUR,
  TOTAL_SLOTS,
  selectedPlaceIdx,
}: Readonly<TimeSlotSelectorProps>) {
  const TOTAL_DATES = selectedDates.length;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateSlot = (index: number) => {
    // console.log("updateSlot", index);
    const row = Math.floor(index / TOTAL_DATES);
    const col = index % TOTAL_DATES;
    setSelectedSlots((slots) => {
      const newSlots = [...slots];
      newSlots[row][col][selectedPlaceIdx] =
        !newSlots[row][col][selectedPlaceIdx];
      return newSlots;
    });
  };

  const { handleStart, handleMove, handleEnd, handleTouchMove } = useDrag(
    updateSlot,
    TOTAL_SLOTS,
    TOTAL_DATES
  );

  const MAX_CELL_WIDTH = 80;

  return (
    <div>
      <div
        className="grid gap-2 mb-2"
        style={{
          gridTemplateColumns: `repeat(${TOTAL_DATES}, minmax(0, 1fr))`,
          maxWidth: TOTAL_DATES * MAX_CELL_WIDTH,
        }}
      >
        {selectedDates.map((date, index) => (
          <div
            key={index}
            className="p-2 font-bold text-center"
            style={{ maxWidth: MAX_CELL_WIDTH }}
          >
            {date}
          </div>
        ))}
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateRows: `repeat(${TOTAL_SLOTS}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${TOTAL_DATES}, minmax(0, 1fr))`,
          maxWidth: TOTAL_DATES * MAX_CELL_WIDTH,
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
                  className={`p-2 border ${
                    selectedSlots[slotIndex][dateIndex][selectedPlaceIdx]
                      ? "bg-green-500"
                      : "bg-white"
                  } cursor-pointer`}
                  style={{ maxWidth: MAX_CELL_WIDTH }}
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
    </div>
  );
}
