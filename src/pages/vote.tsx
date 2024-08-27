import TimeSlotSelector from "@components/TimeSlotSelector";
import { VOTE_DATA } from "@constants/voteConfig";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@firebase/firebaseClient";

interface VoteProps {
  voteName: string;
  selectedDates: string[];
  startTime: number;
  endTime: number;
  places: string[];
  memberCnt: number;
}

export default function Vote() {
  const router = useRouter();
  const { id } = router.query;

  const SLOT_DURATION = 30;
  const SLOTS_PER_HOUR = 60 / SLOT_DURATION;
  const HOUR_CNT = VOTE_DATA.endTime - VOTE_DATA.startTime;
  const TOTAL_SLOTS = HOUR_CNT * SLOTS_PER_HOUR; // row cnt

  const [voteData, setVoteData] = useState<VoteProps | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<boolean[][][]>([]);
  const [selectedPlaceIdx, setSelectedPlaceIdx] = useState(0);

  useEffect(() => {
    const fetchVoteData = async () => {
      if (id) {
        if (!db) {
          console.log("firestore db is null");
          return;
        }
        const docRef = doc(db, "votes", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const voteData = docSnap.data();
          setVoteData(voteData as VoteProps);
          setSelectedSlots(
            Array.from({ length: TOTAL_SLOTS }, () =>
              Array.from({ length: voteData.selectedDates.length }, () =>
                Array.from({ length: voteData.places.length }, () => false)
              )
            )
          );
        } else {
          console.log("문서가 존재하지 않습니다.");
        }
      }
    };
    fetchVoteData();
  }, [id]);

  const handlePlaceClick = (idx: number) => {
    setSelectedPlaceIdx(idx);
  };

  const calculateSelectedTimes = (placeIdx: number) => {
    if (!voteData) return;
    const selectedTimes: string[][] = Array.from(
      { length: voteData.selectedDates.length },
      () => []
    );

    selectedSlots.forEach((rows, rowIdx) => {
      rows.forEach((cols, colIdx) => {
        cols.forEach((isSelected, placeIndex) => {
          if (isSelected && placeIndex === placeIdx) {
            const hour =
              voteData.startTime + Math.floor(rowIdx / SLOTS_PER_HOUR);
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

  const getTimes = () => {
    if (!voteData) return;

    const times: string[][][] = [];
    voteData.places.forEach((place, placeIdx) => {
      const selectedTimes = calculateSelectedTimes(placeIdx);
      if (selectedTimes) {
        times.push(selectedTimes);
      }
    });
    return times;
  };

  const flattenTo3D = (
    flattenedSlots: boolean[],
    x: number,
    y: number,
    z: number
  ) => {
    const originalArray = new Array(x);

    for (let i = 0; i < x; i++) {
      originalArray[i] = new Array(y);
      for (let j = 0; j < y; j++) {
        originalArray[i][j] = new Array(z);
        for (let k = 0; k < z; k++) {
          originalArray[i][j][k] = flattenedSlots[i * y * z + j * z + k];
        }
      }
    }

    return originalArray;
  };

  const handleVoteSave = async () => {
    if (!voteData) return;

    try {
      const flattenedSlots = selectedSlots.flat(2);

      const ansData = {
        userId: "me",
        voteId: id,
        selectedSlots: flattenedSlots,
        rowCnt: TOTAL_SLOTS,
        dateCnt: voteData.selectedDates.length,
        placeCnt: voteData.places.length,
      };

      // Firestore에 데이터 저장
      if (!db) {
        console.log("firestore db is null");
        return;
      }
      await addDoc(collection(db, "ans"), ansData);
      console.log("투표 저장 성공:", ansData);
    } catch (error) {
      console.error("투표 저장 실패:", error);
    }
  };

  const handleMakeVote = () => {
    router.push("/makeVote");
  };

  if (!voteData)
    return (
      <div className="h-[100vh] flex flex-col justify-center items-center">
        <p>404 NOT FOUND</p>
        <button type="button" onClick={handleMakeVote} className="text-[2rem]">
          투표 만들기
        </button>
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{voteData.voteName}</h1>

      <div className="mb-6">
        <h2 className="text-xl">가능한 시간을 체크해 주세요.</h2>
        <TimeSlotSelector
          selectedSlots={selectedSlots}
          setSelectedSlots={setSelectedSlots}
          selectedDates={voteData.selectedDates}
          startTime={voteData.startTime}
          endTime={voteData.endTime}
          SLOT_DURATION={SLOT_DURATION}
          SLOTS_PER_HOUR={SLOTS_PER_HOUR}
          TOTAL_SLOTS={TOTAL_SLOTS}
          selectedPlaceIdx={selectedPlaceIdx}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl">장소</h2>
        <div className="flex flex-wrap gap-4">
          {voteData.places.map((place, index) => (
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
        <p>{voteData.memberCnt}명</p>
      </div>

      <div className="mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleVoteSave}
        >
          투표하기
        </button>
      </div>
    </div>
  );
}
