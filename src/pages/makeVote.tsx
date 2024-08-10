import { useState } from "react";

export default function MakeVote() {
  const [voteName, setVoteName] = useState("");
  // const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState(9);
  const [endTime, setEndTime] = useState(22);
  const [places, setPlaces] = useState<string[]>([]);
  const [newPlace, setNewPlace] = useState("");
  const [memberCnt, setMemberCnt] = useState(1);

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

  const handleCreateVote = () => {
    console.log("투표이름", voteName);
    console.log("시간대", startTime, endTime);
    console.log("장소", places);
    console.log("인원수", memberCnt);
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
      {/* 날짜 선택 */}
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
