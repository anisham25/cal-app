import { useState, useEffect } from "react";
import { ClipboardIcon } from "@heroicons/react/24/outline";

export default function SharePage() {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    // Runs only on the client
    setLink(`${window.location.origin}/event/123`);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Share your event:</h1>
      {link && (
        <div className="flex items-center gap-3 border border-gray-300 rounded px-4 py-2">
          <span className="text-sm font-mono">{link}</span>
          <button onClick={handleCopy}>
            <ClipboardIcon className="w-5 h-5 text-gray-700" />
          </button>
          {copied && <span className="text-green-600 text-sm">Copied!</span>}
        </div>
      )}
    </div>
  );
}
