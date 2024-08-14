import { useRef } from "react";

export const useDrag = (
  updateSlot: (index: number) => void,
  rowCnt: number,
  columnCnt: number
) => {
  const dragging = useRef(false);
  const currentIndex = useRef<number | null>(null);
  const touchStarted = useRef(false); // 터치 이벤트, 마우스 이벤트 중복 실행 방지

  // 문제: 모바일에서 슬롯 클릭하면 터치 이벤트, 마우스 이벤트 동시에 발생하는 경우 있음. 그 결과 updateSlot 두 번 호출되는 문제 -> handleTouchStart, handleTouchEnd 무시
  // 문제: 모바일에서 start, move가 동시에 발생하는 경우 있음. 그 결과 updateSlot 두 번 호출되는 문제 -> touchStarted 변수
  const handleStart = (index: number) => {
    if (touchStarted.current) return;
    touchStarted.current = true;
    dragging.current = true;
    currentIndex.current = index;
    updateSlot(index);
  };

  const handleMove = (index: number) => {
    if (!dragging.current) return;
    updateSlot(index);
  };

  const handleEnd = () => {
    touchStarted.current = false;
    dragging.current = false;
    currentIndex.current = null;
  };

  const getSlotIndexFromTouch = (
    touchX: number,
    touchY: number,
    containerRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!containerRef.current) return -1;
    const containerRect = containerRef.current.getBoundingClientRect();
    const slotWidth = containerRect.width / columnCnt;
    const slotHeight = containerRect.height / rowCnt;

    const columnIndex = Math.floor((touchX - containerRect.left) / slotWidth);
    const rowIndex = Math.floor((touchY - containerRect.top) / slotHeight);

    // 유효한 인덱스인지 체크
    if (
      rowIndex < 0 ||
      rowIndex >= rowCnt ||
      columnIndex < 0 ||
      columnIndex >= columnCnt
    ) {
      return -1;
    }

    return rowIndex * columnCnt + columnIndex; // 1D 인덱스 계산
  };

  const handleTouchMove = (
    e: React.TouchEvent<HTMLDivElement>,
    containerRef: React.RefObject<HTMLDivElement>
  ) => {
    touchStarted.current = false;
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const index = getSlotIndexFromTouch(touchX, touchY, containerRef);

    if (touchStarted.current) return;
    touchStarted.current = true;

    if (currentIndex.current === index) return;
    dragging.current = true;
    currentIndex.current = index;

    if (index >= 0 && index < rowCnt * columnCnt) handleMove(index);
  };

  return {
    handleStart,
    handleMove,
    handleEnd,
    handleTouchMove,
  };
};
