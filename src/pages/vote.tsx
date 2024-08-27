import TimeSlotSelector from "@components/TimeSlotSelector";
import { VOTE_DATA } from "@constants/voteConfig";
import { useState } from "react";

export default function Vote() {
  const SLOT_DURATION = 30;
  const SLOTS_PER_HOUR = 60 / SLOT_DURATION;
  const HOUR_CNT = VOTE_DATA.endTime - VOTE_DATA.startTime;
  const TOTAL_SLOTS = HOUR_CNT * SLOTS_PER_HOUR; // row cnt
  const TOTAL_DATES = VOTE_DATA.selectedDates.length; // column cnt
  const selectedDates = VOTE_DATA.selectedDates;
  const startTime = VOTE_DATA.startTime;
  const endTime = VOTE_DATA.endTime;
  const places = VOTE_DATA.places;

  const [selectedSlots, setSelectedSlots] = useState<boolean[][][]>(
    Array.from({ length: TOTAL_SLOTS }, () =>
      Array.from({ length: TOTAL_DATES }, () =>
        Array.from({ length: places.length }, () => false)
      )
    )
  );
  const [selectedPlaceIdx, setSelectedPlaceIdx] = useState(0);

  const handlePlaceClick = (idx: number) => {
    setSelectedPlaceIdx(idx);
  };

  const calculateSelectedTimes = (placeIdx: number) => {
    const selectedTimes: string[][] = Array.from(
      { length: selectedDates.length },
      () => []
    );

    selectedSlots.forEach((rows, rowIdx) => {
      rows.forEach((cols, colIdx) => {
        cols.forEach((isSelected, placeIndex) => {
          if (isSelected && placeIndex === placeIdx) {
            const hour = startTime + Math.floor(rowIdx / SLOTS_PER_HOUR);
            const minute = (rowIdx % SLOTS_PER_HOUR) * SLOT_DURATION;

            const formattedTime = `${hour >= 12 ? "오후" : "오전"} ${
              hour % 12 || 12
            }시 ${minute}분`;
            selectedTimes[colIdx].push(formattedTime);
          }
        });
      });
    });

    return selectedTimes;
  };

  const handleVote = () => {
    const times: string[][][] = [];
    places.forEach((place, placeIdx) => {
      const selectedTimes = calculateSelectedTimes(placeIdx);
      // console.log("선택된 시간", selectedTimes);
      // console.log("장소", place);
      times.push(selectedTimes);
    });
    console.log(times);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{VOTE_DATA.voteName}</h1>

      <div className="mb-6">
        <h2 className="text-xl">가능한 시간을 체크해 주세요.</h2>
        <TimeSlotSelector
          selectedSlots={selectedSlots}
          setSelectedSlots={setSelectedSlots}
          selectedDates={selectedDates}
          startTime={startTime}
          endTime={endTime}
          SLOT_DURATION={SLOT_DURATION}
          SLOTS_PER_HOUR={SLOTS_PER_HOUR}
          TOTAL_SLOTS={TOTAL_SLOTS}
          TOTAL_DATES={TOTAL_DATES}
          selectedPlaceIdx={selectedPlaceIdx}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl">장소</h2>
        <div className="flex flex-wrap gap-4">
          {VOTE_DATA.places.map((place, index) => (
            <button
              key={index}
              type="button"
              className={`py-2 px-4 rounded-full border ${
                selectedPlaceIdx === index
                  ? "bg-green-500 text-white"
                  : "border-green-500 text-green-500"
              }`}
              onClick={() => handlePlaceClick(index)}
            >
              {place}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl">참여 인원 수</h2>
        <p>{VOTE_DATA.memberCnt}명</p>
      </div>

      <div className="mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleVote}
        >
          투표하기
        </button>
      </div>
    </div>
  );
}
