import { useState } from "react";
import { X } from "lucide-react";

const AngketModal = ({ isOpen, onClose, userName }) => {
  const [feeling, setFeeling] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await fetch("http://localhost:5000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, feeling, rating, comment }),
    });
    alert(`Terima kasih, ${userName}! Feedback Anda telah dikirim.`);
    setFeeling("");
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Angket Kepuasan</h2>
        <p className="mb-4 text-gray-700">
          Bagaimana perasaan Anda tentang <strong>NURMATH</strong>, {userName}?
        </p>

        <div className="flex justify-between gap-2 mb-4">
          {[
            { label: "Sedih 😞", value: "sedih", color: "red" },
            { label: "Biasa 😐", value: "biasa", color: "gray" },
            { label: "Senang 😊", value: "senang", color: "green" },
          ].map(({ label, value, color }) => (
            <button
              key={value}
              onClick={() => setFeeling(value)}
              className={`flex-1 py-2 rounded-full text-white font-medium transition duration-300
                ${feeling === value ? `bg-${color}-500` : "bg-gray-300"} hover:bg-${color}-600`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-lg mb-2 text-gray-800">Rating:</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl transition ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                } hover:scale-110`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-lg mb-2 text-gray-800">Komentar:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            rows="3"
            placeholder="Tulis komentar Anda..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feeling || rating === 0}
            className={`px-4 py-2 rounded text-white transition font-medium ${
              !feeling || rating === 0
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
};

export default AngketModal;
