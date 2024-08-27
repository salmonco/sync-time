import DateSelector from "@components/DateSelector";
import { db } from "@firebase/firebaseClient";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useState } from "react";

export default function MakeVote() {
  const [voteName, setVoteName] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(9);
  const [endTime, setEndTime] = useState(22);
  const [places, setPlaces] = useState<string[]>([]);
  const [newPlace, setNewPlace] = useState("");
  const [memberCnt, setMemberCnt] = useState(1);
  const router = useRouter();

  const calcTime = (n: number) => {
    if (n === 0 || n === 24) return "12:00 AM";
    if (n > 12) return `${n - 12}:00 PM`;
    return `${n}:00 AM`;
  };

  const handleAddPlace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedPlace = newPlace.trim();
      // 중복 확인 및 유효성 검사
      if (trimmedPlace) {
        setPlaces((prevPlaces) => [...prevPlaces, trimmedPlace]);
        setNewPlace(""); // 입력 필드 초기화
      }
    }
  };

  const handleRemovePlace = (placeToRemove: string) => {
    setPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place !== placeToRemove)
    );
  };

  const handleCreateVote = async () => {
    try {
      const voteData = {
        voteName,
        selectedDates,
        startTime,
        endTime,
        places,
        memberCnt,
      };

      // Firestore에 데이터 저장
      if (!db) {
        console.log("firestore db is null");
        return;
      }
      const docRef = await addDoc(collection(db, "votes"), voteData);
      const documentId = docRef.id;
      console.log("투표 생성 성공:", voteData, documentId);

      // 입력 필드 초기화
      setVoteName("");
      setSelectedDates([]);
      setStartTime(9);
      setEndTime(22);
      setPlaces([]);
      setMemberCnt(1);

      router.push(`/vote?id=${documentId}`);
    } catch (error) {
      console.error("투표 생성 실패:", error);
    }
  };

  return (
    <div className="p-4">
      {/* 투표 이름 입력 */}
      <input
        className="border p-2 mb-4"
        value={voteName}
        onChange={(e) => setVoteName(e.target.value)}
        placeholder="Enter Vote Name"
      />
      <div className="mb-4">
        {/* 날짜 선택 */}
        <DateSelector
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
        />
        <label>Selected Dates:</label>
        <div className="flex flex-col">
          {selectedDates.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
      </div>
      {/* 시간대 선택 */}
      <div className="mb-4">
        <label>Time:</label>
        <select
          name="startTime"
          value={startTime}
          onChange={(e) => setStartTime(+e.target.value)}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <option value={i} key={i}>
              {calcTime(i)}
            </option>
          ))}
        </select>
        <span>to</span>
        <select
          name="endTime"
          value={endTime}
          onChange={(e) => setEndTime(+e.target.value)}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <option value={i} key={i}>
              {calcTime(i)}
            </option>
          ))}
        </select>
      </div>
      {/* 장소 입력 */}
      <div className="mb-4">
        <label>Places:</label>
        <input
          type="text"
          value={newPlace}
          onChange={(e) => setNewPlace(e.target.value)}
          onKeyUp={handleAddPlace}
          placeholder="Add a place and press Enter"
          className="border p-2"
        />
        <div className="flex flex-wrap mb-2">
          {places.map((place, index) => (
            <span
              key={index}
              className="bg-blue-200 p-1 mr-2 rounded flex items-center"
            >
              {place}
              <button
                onClick={() => handleRemovePlace(place)}
                className="ml-2 text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      {/* 인원수 입력 */}
      <div className="mb-4">
        <label htmlFor="memberCount">Number of Members:</label>
        <input
          type="number"
          min={1}
          value={memberCnt}
          onChange={(e) => setMemberCnt(+e.target.value)}
          className="border p-2"
        />
      </div>
      {/* 투표 생성 */}
      <button
        className="bg-blue-500 text-white px-4 py-2"
        onClick={handleCreateVote}
      >
        Create Vote
      </button>
    </div>
  );
}
