import { buildHourMarks, minutesToHHMM } from "../utils/time";
import { COLUMN_HEIGHT } from "../constants";

const marks = buildHourMarks(30);

export default function TimeRuler() {
  return (
    <div className="w-16 shrink-0 relative bg-slate-50 border-l border-slate-200">
      <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center justify-center text-xs text-slate-500 font-bold">
        ساعت
      </div>

      <div className="relative" style={{ height: `${COLUMN_HEIGHT}px` }}>
        {marks.map((min) => {
          const isHour = min % 60 === 0;
          const top = min - marks[0];
          return (
            <div
              key={min}
              className="absolute right-0 left-0 flex justify-start"
              style={{ top: `${top}px`, transform: "translateY(-6px)" }}
            >
              {isHour ? (
                <span className="text-[11px] font-semibold text-slate-600 tabular-nums pr-2 leading-none">
                  {minutesToHHMM(min)}
                </span>
              ) : (
                <span className="text-[9px] text-slate-300 pr-2 leading-none">
                  {minutesToHHMM(min)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}