import TimeSlotSelector from "@components/TimeSlotSelector";
import { VOTE_DATA } from "@constants/voteConfig";
import { useState } from "react";

export default function Vote() {
  const SLOT_DURATION = 30;
  const SLOTS_PER_HOUR = 60 / SLOT_DURATION;
  const HOUR_CNT = VOTE_DATA.endTime - VOTE_DATA.startTime;
  const TOTAL_SLOTS = HOUR_CNT * SLOTS_PER_HOUR; // row cnt
  const TOTAL_DATES = VOTE_DATA.selectedDates.length; // column cnt

  const [selectedSlots, setSelectedSlots] = useState<boolean[][]>(
    Array.from({ length: TOTAL_SLOTS }, () =>
      Array.from({ length: TOTAL_DATES }, () => false)
    )
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{VOTE_DATA.voteName}</h1>

      <div className="mb-6">
        <h2 className="text-xl">가능한 시간을 체크해 주세요.</h2>
        <TimeSlotSelector
          selectedSlots={selectedSlots}
          setSelectedSlots={setSelectedSlots}
          selectedDates={VOTE_DATA.selectedDates}
          startTime={VOTE_DATA.startTime}
          endTime={VOTE_DATA.endTime}
          SLOT_DURATION={SLOT_DURATION}
          SLOTS_PER_HOUR={SLOTS_PER_HOUR}
          TOTAL_SLOTS={TOTAL_SLOTS}
          TOTAL_DATES={TOTAL_DATES}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl">장소</h2>
        <ul className="list-disc list-inside">
          {VOTE_DATA.places.map((place, index) => (
            <li key={index}>{place}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl">참여 인원 수</h2>
        <p>{VOTE_DATA.memberCnt}명</p>
      </div>

      {/* 추가적인 투표 기능 구현 부분 */}
      <div className="mt-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          투표하기
        </button>
      </div>
    </div>
  );
}
