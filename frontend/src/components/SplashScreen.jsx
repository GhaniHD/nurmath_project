import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onFinish }) => {
  const texts = [
    `<h1>⛏️ Selamat Datang di Dunia NurMath!</h1>
    <p>🌍 "Di bawah lapisan tanah, pengetahuan adalah harta yang menanti."</p>`,
    `<p>Dunia NurMath dahulu hidup harmoni, dijaga oleh enam elemen geologis:</p>
    <p><strong>🪨 Batuan Ilmu, 🌍 Tanah Data, 🌊 Lautan Fakta, 📊 Daratan Diagram, ☁️ Langit Informasi, dan 🌋 Luar Angkasa Representasi.</strong></p>`,
    `<p>Namun, gempa misterius mengguncang dunia, memecah lapisan pengetahuan dan menghamburkan artefak data.</p>
    <p>⚡ Kini, NurMath terancam terkubur dalam kegelapan selamanya.</p>`,
    `<p>Satu-satunya harapan ada pada <strong>NurM si Penjelajah Geologis</strong>, yang dengan peralatan ekspedisinya siap menggali rahasia dunia.</p>
    <p>⛏️ Tapi petualangan ini terlalu berat untuk dilakukan sendirian…</p>
    <hr class="my-4">
    <p class="text-xl font-bold">🌟 Ayo bergabung dengan NurM dalam Misi Penyelamatan Pengetahuan!</p>
    <p>Kamu akan menjelajahi setiap lapisan, memecahkan teka-teki geologis dan tantangan matematika yang menguji logika dan kreativitasmu!</p>`
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const textDuration = 5000;

  const globalStyles = `
    body {
      font-family: 'Cinzel', serif;
      overflow: hidden;
      background: linear-gradient(135deg, #4b2e1a 0%, #3f220f 30%, #5c3a1f 60%, #4b2e1a 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      width: 100vw;
    }

    .container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    .text-overlay {
      position: absolute;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 800px;
      padding: 30px;
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      border-radius: 20px;
      text-align: center;
      font-size: 1.1em;
      line-height: 1.6;
      transition: opacity 0.5s;
      z-index: 20;
    }

    .text-overlay h1 {
      font-size: 2em;
      margin-bottom: 15px;
      color: #ffbf00;
    }

    .skip-button {
      position: absolute;
      bottom: 30px;
      right: 30px;
      padding: 12px 24px;
      background: rgba(255, 191, 0, 0.2);
      border: 2px solid rgba(255, 191, 0, 0.5);
      color: #ffbf00;
      font-weight: 600;
      border-radius: 25px;
      backdrop-filter: blur(10px);
      cursor: pointer;
      z-index: 30;
      font-family: 'Cinzel', serif;
      text-transform: uppercase;
    }

    .nurm-character-img {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80vw;
      max-width: 600px;
      z-index: 10;
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-15px); }
      100% { transform: translateX(-50%) translateY(0); }
    }
  `;

  useEffect(() => {
    // Inject global CSS styles
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);

    // Timer to switch texts
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    }, textDuration);

    return () => {
      clearInterval(interval);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="container">
      <div
        className="text-overlay"
        dangerouslySetInnerHTML={{ __html: texts[currentTextIndex] }}
      ></div>

      <img
        src="/images/misi-1.png"
        alt="NurM si Penjelajah Geologis"
        className="nurm-character-img"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/400x400/4b2e1a/ffbf00?text=⛏️+NurM+Explorer";
        }}
      />

      <button className="skip-button" onClick={onFinish}>
        ⛏️ Lewati
      </button>
    </div>
  );
};

export default SplashScreen;
