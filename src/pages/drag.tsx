import { useState, useRef } from "react";

const hours = Array.from({ length: 24 }, (_, i) => i);

function TimeSlotSelector() {
  const [selectedSlots, setSelectedSlots] = useState<boolean[]>(
    Array(24).fill(false)
  );
  const dragging = useRef(false);

  const handleStart = (index: number) => {
    dragging.current = true;
    setSelectedSlots((slots) => {
      const newSlots = [...slots];
      newSlots[index] = !newSlots[index];
      return newSlots;
    });
  };

  const handleMove = (index: number) => {
    if (!dragging.current) return;
    setSelectedSlots((slots) => {
      const newSlots = [...slots];
      newSlots[index] = !newSlots[index];
      return newSlots;
    });
  };

  const handleEnd = () => {
    dragging.current = false;
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      {hours.map((hour, index) => (
        <div
          key={index}
          className={`p-4 border ${
            selectedSlots[index] ? "bg-blue-500" : "bg-white"
          }`}
          onMouseDown={() => handleStart(index)}
          onMouseEnter={() => handleMove(index)}
          onMouseUp={handleEnd}
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
