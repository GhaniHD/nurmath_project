import { useState } from 'react';
import axios from 'axios';

const NameModal = ({ isOpen, onSubmit }) => {
  const [userName, setUserName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!userName.trim()) {
      alert('Masukkan nama penjelajah!');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${API_URL}/api/users`, {
        userName,
      });

      const { userId, userName: returnedName } = response.data;
      onSubmit({ userId, userName: returnedName });
    } catch (err) {
      console.error('Error submitting name:', err);
      alert('Gagal membuat penjelajah');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in">
      <div className="relative bg-gradient-to-b from-stone-900/95 to-brown-950/95 p-8 rounded-2xl border-4 border-amber-700/60 shadow-[0_8px_25px_rgba(255,107,0,0.3)] backdrop-blur-lg w-full max-w-md">
        {/* Crack Effect Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath stroke="rgba(255,215,0,0.2)" stroke-width="2" fill="none" d="M10 10L30 50L50 20L70 60L90 30"/%3E%3C/svg%3E')`,
            backgroundSize: '200px 200px',
          }}
        />
        <h2 className="text-2xl font-bold text-amber-100 mb-6 drop-shadow-[0_1px_3px_rgba(139,69,19,0.8)] font-cinzel">
          Masukkan Nama Penjelajah
        </h2>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-3 text-gray-100 placeholder-gray-400 transition-all duration-300 border-2 rounded-lg bg-gray-800/60 border-amber-700/50 focus:outline-none focus:border-amber-500/70"
          placeholder="Nama penjelajah..."
        />
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="group relative px-6 py-2 bg-gradient-to-r from-amber-700 to-orange-800 rounded-full text-amber-100 font-semibold hover:scale-105 transition-all shadow-[0_5px_15px_rgba(255,107,0,0.4)]"
          >
            <span className="relative z-10">Simpan</span>
            <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-amber-500/30 group-hover:opacity-100 animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NameModal;