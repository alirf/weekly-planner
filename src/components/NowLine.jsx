import { PX_PER_MINUTE, DAY_START_MIN, DAY_END_MIN } from "../constants";
import { minutesToHHMM, dateToMinutes } from "../utils/time";

export default function NowLine({ now }) {
  const nowMinutes = dateToMinutes(now);
  const top = (nowMinutes - DAY_START_MIN) * PX_PER_MINUTE;

  if (nowMinutes < DAY_START_MIN || nowMinutes > DAY_END_MIN) return null;

  return (
    <div
      className="absolute right-0 left-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="relative flex items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-md shadow-red-500/50 animate-pulse-soft" />

        <div className="flex-1 h-[2px] bg-red-500 shadow-sm" />

        <div className="absolute -top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums shadow-md">
          {minutesToHHMM(nowMinutes)}
        </div>
      </div>
    </div>
  );
}