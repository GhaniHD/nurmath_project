import { useState, useEffect, useRef } from 'react';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Volume default 50%

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = true;
      audioRef.current
        .play()
        .then(() => {
          audioRef.current.muted = false;
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn('Autoplay diblokir oleh browser:', error);
        });
    }
  }, [volume]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-blue-800 rounded-lg p-2 flex items-center space-x-2">
      <audio ref={audioRef} src="/audio/musicBackground.mp3" loop />
      <button
        onClick={togglePlay}
        className="px-2 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        className="w-20 accent-blue-400"
        aria-label="Adjust music volume"
      />
    </div>
  );
};

export default AudioPlayer;