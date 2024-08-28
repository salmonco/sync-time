import TimeSlotSelector from "@components/TimeSlotSelector";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "@firebase/firebaseClient";
import LayerPopup from "@components/LayerPopup";
import { useModal } from "@hooks/useModal";

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

  const modalRef = useRef(null);
  const { isModalOpen, modalText, openModal, closeModal } = useModal();

  const SLOT_DURATION = 30;
  const SLOTS_PER_HOUR = 60 / SLOT_DURATION;
  const hour_cnt = useRef(0);
  const total_slots = useRef(0);

  const [voteData, setVoteData] = useState<VoteProps | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<boolean[][][]>([]);
  const [selectedPlaceIdx, setSelectedPlaceIdx] = useState(0);
  const [inputId, setInputId] = useState("");
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState<string[][][]>([]);
  const [currentMemberCnt, setCurrentMemberCnt] = useState(0);

  const calculateSelectedTimes = (
    resultSlots: boolean[][][],
    placeIdx: number
  ) => {
    if (!voteData) return;

    const selectedTimes: string[][] = Array.from(
      { length: voteData.selectedDates.length },
      () => []
    );

    resultSlots.forEach((rows, rowIdx) => {
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

  const getTimes = (resultSlots: boolean[][][]) => {
    if (!voteData) return;

    const times: string[][][] = [];
    voteData.places.forEach((place, placeIdx) => {
      const selectedTimes = calculateSelectedTimes(resultSlots, placeIdx);
      if (selectedTimes) {
        times.push(selectedTimes);
      }
    });
    return times;
  };

  useEffect(() => {
    if (!id) return;
    const fetchVoteData = async () => {
      if (!db) {
        console.log("firestore db is null");
        return;
      }
      const docRef = doc(db, "votes", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const voteData = docSnap.data();
        const HOUR_CNT = voteData.endTime - voteData.startTime;
        const TOTAL_SLOTS = HOUR_CNT * SLOTS_PER_HOUR; // row cnt
        hour_cnt.current = HOUR_CNT;
        total_slots.current = TOTAL_SLOTS;
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
    };
    fetchVoteData();
  }, [id]);

  useEffect(() => {
    if (!voteData) return;

    const calculateResult = async () => {
      try {
        if (!db) {
          console.log("firestore db is null");
          return;
        }
        const ansCollection = collection(db, "ans");
        const q = query(ansCollection, where("voteId", "==", id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("아무도 투표를 하지 않아서 투표 결과가 없습니다.");
          return;
        }

        const overlappedSlots: boolean[][][] = Array.from(
          { length: total_slots.current },
          () =>
            Array.from({ length: voteData.selectedDates.length }, () =>
              Array.from({ length: voteData.places.length }, () => true)
            )
        );
        let currentMemberCnt = 0;
        querySnapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
          const { selectedSlots, rowCnt, dateCnt, placeCnt } = doc.data();
          const slots = flattenTo3D(selectedSlots, rowCnt, dateCnt, placeCnt);
          for (let r = 0; r < rowCnt; r++) {
            for (let c = 0; c < dateCnt; c++) {
              for (let p = 0; p < placeCnt; p++) {
                overlappedSlots[r][c][p] &&= slots[r][c][p];
              }
            }
          }
          currentMemberCnt++;
        });
        setCurrentMemberCnt(currentMemberCnt);
        const result = getTimes(overlappedSlots);
        console.log("result", result);
        if (result) {
          setResult(result);
        }
      } catch (error) {
        console.error("투표 결과 계산 실패", error);
      }
    };
    calculateResult();
  }, [voteData, userId]);

  const handlePlaceClick = (idx: number) => {
    setSelectedPlaceIdx(idx);
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
    if (!voteData || !userId) return;

    try {
      const flattenedSlots = selectedSlots.flat(2);

      const ansData = {
        userId,
        voteId: id,
        selectedSlots: flattenedSlots,
        rowCnt: total_slots.current,
        dateCnt: voteData.selectedDates.length,
        placeCnt: voteData.places.length,
      };

      // Firestore에 데이터 저장
      if (!db) {
        console.log("firestore db is null");
        return;
      }

      const ansCollection = collection(db, "ans");
      const q = query(
        ansCollection,
        where("voteId", "==", id),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(ansCollection, ansData);
      } else {
        const existingDoc = querySnapshot.docs[0];
        const docRef = doc(db, "ans", existingDoc.id);
        await setDoc(docRef, ansData, { merge: true });
      }
      console.log("투표 저장 성공:", ansData);
      alert("투표가 저장되었습니다.");
      setUserId("");
      setSelectedSlots(
        Array.from({ length: total_slots.current }, () =>
          Array.from({ length: voteData.selectedDates.length }, () =>
            Array.from({ length: voteData.places.length }, () => false)
          )
        )
      );
    } catch (error) {
      console.error("투표 저장 실패:", error);
    }
  };

  const handleMakeVote = () => {
    router.push("/makeVote");
  };

  const handleLogin = () => {
    if (!inputId.trim()) {
      alert("아이디를 입력해 주세요.");
      setInputId("");
      return;
    }

    const fetchAnsData = async () => {
      try {
        if (!db) {
          console.log("firestore db is null");
          return;
        }
        const ansCollection = collection(db, "ans");
        const q = query(
          ansCollection,
          where("voteId", "==", id),
          where("userId", "==", inputId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("해당 문서가 없습니다.");
          return;
        }

        querySnapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
          const { selectedSlots, rowCnt, dateCnt, placeCnt } = doc.data();
          const slots = flattenTo3D(selectedSlots, rowCnt, dateCnt, placeCnt);
          setSelectedSlots(slots);
        });
      } catch (error) {
        console.error("오류 발생: ", error);
      }
    };
    fetchAnsData();
    setUserId(inputId);
    setInputId("");
  };

  const handleLogout = () => {
    if (!voteData) return;

    setUserId("");
    setSelectedSlots(
      Array.from({ length: total_slots.current }, () =>
        Array.from({ length: voteData.selectedDates.length }, () =>
          Array.from({ length: voteData.places.length }, () => false)
        )
      )
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // alert(`${text}${"\n"} 클립보드에 복사되었습니다.`);
      openModal(`"${text}" 클립보드에 복사되었습니다.`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyClick = () => {
    const textToCopy = `https://sync-time.vercel.app/vote?id=${id}`;
    copyToClipboard(textToCopy);
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
    <div className="p-4 flex flex-col gap-10">
      <div className="flex gap-10">
        <h1 className="text-2xl font-bold mb-4">{voteData.voteName}</h1>
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleCopyClick}
        >
          링크복사 click!
        </button>
      </div>

      <div className="flex justify-around gap-6">
        <div>
          {userId ? (
            <div className="flex flex-col gap-4">
              <h2>{userId}님 안녕하세요.</h2>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <h2 className="text-xl">로그인해 주세요.</h2>
                <input
                  type="text"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  className="border p-2"
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                  로그인하기
                </button>
              </form>
              <div className="flex flex-col gap-8">
                {result.length
                  ? result.map((dates, placeIdx) => (
                      <div key={`place ${placeIdx}`}>
                        <span className="text-[1.8rem]">
                          {voteData.places[placeIdx]}
                        </span>
                        <div className="flex flex-col gap-3">
                          {dates.map((times, dateIdx) => (
                            <div key={`date ${dateIdx}`}>
                              <span>{voteData.selectedDates[dateIdx]}</span>
                              <div className="flex flex-col">
                                {times.map((time, timeIdx) => (
                                  <span key={`time ${timeIdx}`}>{time}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="mb-6">
            <h2 className="text-xl">참여 인원 수</h2>
            <p>
              {currentMemberCnt} / {voteData.memberCnt}명
            </p>
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
            <h2 className="text-xl">가능한 시간을 체크해 주세요.</h2>
            <TimeSlotSelector
              selectedSlots={selectedSlots}
              setSelectedSlots={setSelectedSlots}
              selectedDates={voteData.selectedDates}
              startTime={voteData.startTime}
              endTime={voteData.endTime}
              SLOT_DURATION={SLOT_DURATION}
              SLOTS_PER_HOUR={SLOTS_PER_HOUR}
              TOTAL_SLOTS={total_slots.current}
              selectedPlaceIdx={selectedPlaceIdx}
            />
          </div>

          <div className="mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
              onClick={handleVoteSave}
              disabled={!voteData || !userId}
            >
              투표하기
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed top-0 left-0 w-full z-30 bg-black/40 h-full flex justify-center items-center"
          ref={modalRef}
          onClick={(e) => {
            if (e.target === modalRef.current) closeModal();
          }}
        >
          <LayerPopup
            text={modalText}
            btnText={"확인"}
            callbackFn={closeModal}
          />
        </div>
      )}
    </div>
  );
}
