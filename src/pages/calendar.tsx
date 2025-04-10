import { useState, useRef } from "react";
import { useRouter } from "next/router";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SLOT_COUNT = 32; // 6:00 AM to 10:00 PM
const SLOT_HEIGHT = 40;

const hours = Array.from({ length: SLOT_COUNT }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? "00" : "30";
  return `${h % 12 || 12}:${m} ${h < 12 || h === 24 ? "AM" : "PM"}`;
});

type Selection = {
  id: number;
  dayIndex: number;
  startIndex: number;
  endIndex: number;
};

let idCounter = 0;

export default function CalendarPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Selection[]>([]);
  const [draft, setDraft] = useState<Selection | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<{ id: number; type: "top" | "bottom" } | null>(null);
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState("");
  const ignoreNextClickRef = useRef(false);

  const gridRef = useRef<HTMLDivElement>(null);

  const getCellIndex = (e: MouseEvent) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / (rect.width / 7));
    const row = Math.floor(y / SLOT_HEIGHT);

    if (col < 0 || col >= 7 || row < 0 || row >= SLOT_COUNT) return null;
    return { col, row };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }
    const cell = getCellIndex(e.nativeEvent);
    if (!cell) return;
    setDraft({ id: idCounter++, dayIndex: cell.col, startIndex: cell.row, endIndex: cell.row });
    setDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && draft) {
      const cell = getCellIndex(e.nativeEvent);
      if (!cell || cell.col !== draft.dayIndex) return;
      setDraft({ ...draft, endIndex: cell.row });
    }

    if (resizing) {
      const cell = getCellIndex(e.nativeEvent);
      if (!cell) return;
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== resizing.id) return block;
          if (resizing.type === "top") {
            return { ...block, startIndex: Math.min(cell.row, block.endIndex - 1) };
          } else {
            return { ...block, endIndex: Math.max(cell.row, block.startIndex + 1) };
          }
        })
      );
    }
  };

  const handleMouseUp = () => {
    if (draft) {
      setBlocks((prev) => [...prev, draft]);
      setDraft(null);
    }
    setDragging(false);
    setResizing(null);
  };

  const getTimeFromIndex = (index: number) => {
    const totalMins = (index + 12) * 30; // shift index since we start at 6AM
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    const minute = m === 0 ? "00" : "30";
    return `${hour}:${minute} ${ampm}`;
  };

  const handleDeleteBlock = (id: number) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-2xl font-bold px-6 pt-6 pb-4">📅 Select Your Availability</h1>

      <div className="ml-14 grid grid-cols-7 text-center text-sm font-medium text-gray-700 px-4">
        {days.map((day) => (
          <div key={day} className="py-2 border-b border-gray-200">
            {day}
          </div>
        ))}
      </div>

      <div
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex overflow-y-scroll"
        style={{ height: "calc(100vh - 160px)" }}
      >
        <div className="w-14 flex flex-col text-right pr-2 text-xs text-gray-500 pt-2 flex-shrink-0">
          {hours.map((time, i) => (
            <div key={i} style={{ height: `${SLOT_HEIGHT}px` }}>
              {i % 2 === 0 ? time : ""}
            </div>
          ))}
        </div>

        <div
          ref={gridRef}
          onMouseDown={handleMouseDown}
          className="relative flex-1 grid grid-cols-7 border-t border-l"
          style={{ height: `${SLOT_HEIGHT * SLOT_COUNT}px`, userSelect: "none" }}
        >
          {Array.from({ length: 7 * SLOT_COUNT }).map((_, i) => (
            <div
              key={i}
              className="border-b border-r"
              style={{
                height: `${SLOT_HEIGHT}px`,
                borderColor: "rgba(229, 231, 235, 0.5)",
              }}
            />
          ))}

          {blocks.map((block) => {
            const top = Math.min(block.startIndex, block.endIndex);
            const bottom = Math.max(block.startIndex, block.endIndex);
            const height = (bottom - top + 1) * SLOT_HEIGHT;

            return (
              <div
                key={block.id}
                className="absolute bg-gray-700 text-white text-xs rounded-md px-2 py-1 shadow-md z-20"
                style={{
                  top: `${top * SLOT_HEIGHT}px`,
                  left: `calc((100% / 7) * ${block.dayIndex})`,
                  height: `${height}px`,
                  width: `calc(100% / 7)`
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    ignoreNextClickRef.current = true;
                    handleDeleteBlock(block.id);
                  }}
                  className="absolute top-0 right-0 text-white bg-gray-800 text-xs px-1 py-0.5 hover:bg-red-600 z-30"
                >
                  ×
                </button>

                <div
                  className="absolute top-0 left-0 w-full h-2 cursor-ns-resize"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setResizing({ id: block.id, type: "top" });
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setResizing({ id: block.id, type: "bottom" });
                  }}
                />

                <div className="font-semibold text-sm mt-2">(No title)</div>
                <div>
                  {getTimeFromIndex(top)} – {getTimeFromIndex(bottom + 1)}
                </div>
              </div>
            );
          })}

          {draft && (
            <div
              className="absolute bg-gray-500/80 text-white text-xs rounded-md px-2 py-1 shadow-md z-10"
              style={{
                top: `${Math.min(draft.startIndex, draft.endIndex) * SLOT_HEIGHT}px`,
                left: `calc((100% / 7) * ${draft.dayIndex})`,
                height: `${(Math.abs(draft.endIndex - draft.startIndex) + 1) * SLOT_HEIGHT}px`,
                width: `calc(100% / 7)`
              }}
            >
              <div className="font-semibold text-sm">(No title)</div>
              <div>
                {getTimeFromIndex(Math.min(draft.startIndex, draft.endIndex))} – {getTimeFromIndex(Math.max(draft.startIndex, draft.endIndex) + 1)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full border-t bg-white p-4 flex flex-wrap items-center justify-between">
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm">
            Duration:
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            Location:
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border rounded px-2 py-1 w-64"
              placeholder="e.g. Zoom or Café"
            />
          </label>
        </div>

        <button
          className="ml-auto bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => router.push("/phone")}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
