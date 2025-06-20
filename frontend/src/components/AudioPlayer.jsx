import { useState, useEffect, useRef } from 'react';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Volume default 50%

  // Fungsi untuk toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Sinkronkan volume
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Putar otomatis saat komponen dimuat dan atur volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      // Coba putar otomatis, tetapi muted awalnya untuk menghindari pembatasan browser
      audioRef.current.muted = true;
      audioRef.current
        .play()
        .then(() => {
          // Setelah berhasil diputar, hapus muted
          audioRef.current.muted = false;
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn('Autoplay diblokir oleh browser:', error);
          // Jika autoplay gagal, biarkan pengguna memulai secara manual
        });
    }
  }, [volume]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-blue-400/30 flex items-center space-x-4">
      <audio ref={audioRef} src="/audio/musicBackground.mp3" loop />
      <button
        onClick={togglePlay}
        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-300"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        className="w-24 accent-blue-400"
        aria-label="Adjust music volume"
      />
    </div>
  );
};

export default AudioPlayer;