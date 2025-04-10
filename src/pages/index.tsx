import { useState } from "react";
import { useRouter } from "next/router";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Home() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-white">
      <h1 className="text-3xl font-bold mb-6">Let’s schedule it</h1>

      <input
        type="text"
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        className="border border-blue-500 text-blue-500 rounded px-4 py-2 mb-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      <p className="text-sm text-gray-600 mb-2">Select all days for your event</p>

      <DayPicker
        mode="multiple"
        selected={selectedDays}
        onSelect={(days) => setSelectedDays(days || [])}
        fromDate={new Date()}
        className="bg-white p-4 rounded shadow"
      />

      {selectedDays.length > 0 && (
        <button
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => router.push("/calendar")}
        >
          Next →
        </button>
      )}
    </main>
  );
}
