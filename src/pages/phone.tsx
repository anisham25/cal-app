import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function PhonePage() {
  const [phone, setPhone] = useState("");
  const router = useRouter();

  useEffect(() => {
    const phoneRegex = /^\+?\d{10,15}$/;
    if (phoneRegex.test(phone)) {
      router.push("/finish"); // ✅ Redirects to finish/share page
    }
  }, [phone, router]);

  return (
    <div className="bg-white w-full h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-semibold mb-4">Great, almost done!</h1>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <label className="text-sm font-medium text-gray-700 text-center sm:text-right">
          Enter phone # to stay up<br /> to date on your event!
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          className="border rounded px-4 py-2 w-60 text-sm"
        />
      </div>
    </div>
  );
}
