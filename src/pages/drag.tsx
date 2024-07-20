import { useState, useRef } from "react";

const hours = Array.from({ length: 24 }, (_, i) => i);

function TimeSlotSelector() {
  const [selectedSlots, setSelectedSlots] = useState<boolean[]>(
    Array(24).fill(false)
  );
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentIndex = useRef<number | null>(null);
  const touchStarted = useRef(false); // 터치 이벤트, 마우스 이벤트 중복 실행 방지

  const updateSlot = (index: number) => {
    // console.log("updateSlot", index);
    setSelectedSlots((slots) => {
      const newSlots = [...slots];
      newSlots[index] = !newSlots[index];
      return newSlots;
    });
  };
  // 문제: 모바일에서 슬롯 클릭하면 터치 이벤트, 마우스 이벤트 동시에 발생하는 경우 있음. 그 결과 updateSlot 두 번 호출되는 문제 -> handleTouchStart, handleTouchEnd 무시
  // 문제: 모바일에서 start, move가 동시에 발생하는 경우 있음. 그 결과 updateSlot 두 번 호출되는 문제 -> touchStarted 변수
  const handleStart = (index: number) => {
    // console.log(
    //   "handleStart",
    //   dragging.current,
    //   currentIndex.current,
    //   index,
    //   touchStarted.current
    // );
    if (touchStarted.current) return;
    touchStarted.current = true;
    dragging.current = true;
    currentIndex.current = index;
    updateSlot(index);
  };

  const handleMove = (index: number) => {
    // console.log("handleMove", dragging.current, currentIndex.current, index);
    if (!dragging.current) return;
    updateSlot(index);
  };

  const handleEnd = () => {
    touchStarted.current = false;
    // console.log("handleEnd", touchStarted.current);
    dragging.current = false;
    currentIndex.current = null;
  };

  const getSlotIndexFromTouch = (touchY: number) => {
    if (!containerRef.current) return -1;
    const containerRect = containerRef.current.getBoundingClientRect();
    const slotHeight = containerRect.height / 24;
    return Math.floor((touchY - containerRect.top) / slotHeight);
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    index: number
  ) => {
    // e.preventDefault();
    // touchStarted.current = true;
    // dragging.current = true;
    // currentIndex.current = index;
    // updateSlot(index);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // e.preventDefault();
    touchStarted.current = false;
    const touchY = e.touches[0].clientY;
    const index = getSlotIndexFromTouch(touchY);
    // console.log(
    //   "handleTouchMove",
    //   currentIndex.current,
    //   index,
    //   touchStarted.current
    // );
    if (touchStarted.current) return;
    touchStarted.current = true;
    if (currentIndex.current === index) return;
    dragging.current = true;
    currentIndex.current = index;
    if (index >= 0 && index < 24) handleMove(index);
  };

  const handleTouchEnd = (index: number) => {
    // touchStarted.current = false;
    // handleEnd();
  };

  return (
    <div className="grid grid-cols-1 gap-2" ref={containerRef}>
      {hours.map((hour, index) => (
        <div
          key={index}
          className={`p-4 border ${
            selectedSlots[index] ? "bg-blue-500" : "bg-white"
          }`}
          onMouseDown={() => handleStart(index)}
          onMouseEnter={() => handleMove(index)}
          onMouseUp={handleEnd}
          onTouchStart={(e) => handleTouchStart(e, index)}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => handleTouchEnd(index)}
        >
          {hour}:00
        </div>
      ))}
    </div>
  );
}

export default function Drag() {
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">
            Select Available Time Slots
          </h1>
          <TimeSlotSelector />
        </div>
      </div>
    </div>
  );
}
