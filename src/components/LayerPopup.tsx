interface LayerPopupProps {
  text: string;
  btnText: string;
  callbackFn: () => void;
}

export default function LayerPopup({
  text,
  btnText,
  callbackFn,
}: Readonly<LayerPopupProps>) {
  return (
    <div className="w-[323px] shadow-modal rounded-[10px] bg-[#EFF1F4]">
      <div className="h-[126px] flex justify-center items-center border-b border-b-[#D5D8DC] p-6">
        <span className="font-m text-[1.8rem] text-[#3B3F4A]">{text}</span>
      </div>
      <div className="flex justify-center">
        <button
          className="w-full h-[47px] border-r border-r-[#D5D8DC]"
          onClick={callbackFn}
        >
          <span className="font-b text-[#5A5E6A]">{btnText}</span>
        </button>
      </div>
    </div>
  );
}
