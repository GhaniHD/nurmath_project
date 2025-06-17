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
  const textDuration = 3001;

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

    * {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    *::-webkit-scrollbar {
      display: none;
    }

    .container {
      position: relative;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #4b2e1a 0%, #3f220f 30%, #5c3a1f 60%, #4b2e1a 100%);
      overflow: hidden;
      box-sizing: border-box;
    }

    .mineral-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    .particle {
      position: absolute;
      background: rgba(255, 191, 0, 0.5);
      border-radius: 50%;
      animation: glow 3s infinite alternate;
    }

    .particle:nth-child(1) { top: 10%; left: 15%; width: 2px; height: 2px; animation-delay: 0s; }
    .particle:nth-child(2) { top: 20%; left: 80%; width: 1px; height: 1px; animation-delay: 0.5s; }
    .particle:nth-child(3) { top: 30%; left: 25%; width: 3px; height: 3px; animation-delay: 1s; }
    .particle:nth-child(4) { top: 40%; left: 70%; width: 2px; height: 2px; animation-delay: 1.5s; }
    .particle:nth-child(5) { top: 50%; left: 35%; width: 1px; height: 1px; animation-delay: 2s; }
    .particle:nth-child(6) { top: 60%; left: 85%; width: 2px; height: 2px; animation-delay: 0.3s; }
    .particle:nth-child(7) { top: 70%; left: 20%; width: 1px; height: 1px; animation-delay: 0.8s; }
    .particle:nth-child(8) { top: 80%; left: 65%; width: 3px; height: 3px; animation-delay: 1.3s; }
    .particle:nth-child(9) { top: 90%; left: 45%; width: 2px; height: 2px; animation-delay: 1.8s; }
    .particle:nth-child(10) { top: 15%; left: 55%; width: 1px; height: 1px; animation-delay: 2.3s; }

    @keyframes glow {
      0% { opacity: 0.3; transform: scale(1); }
      100% { opacity: 0.8; transform: scale(1.3); }
    }

    .geological-elements {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    }

    .rock {
      width: 60px; height: 60px;
      background: radial-gradient(circle at 30% 30%, #8b4513, #5c4033);
      top: 15%; left: 10%;
      animation-delay: 0s;
    }
    .crystal {
      width: 50px; height: 50px;
      background: radial-gradient(circle at 30% 30%, #ffd700, #b8860b);
      top: 25%; right: 15%;
      animation-delay: 1s;
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    .lava {
      width: 45px; height: 45px;
      background: radial-gradient(circle at 30% 30%, #ff4500, #8b0000);
      bottom: 20%; left: 15%;
      animation-delay: 2s;
    }
    .soil {
      width: 55px; height: 55px;
      background: radial-gradient(circle at 30% 30%, #4b2e1a, #3f220f);
      top: 60%; right: 10%;
      animation-delay: 3s;
    }
    .fossil {
      width: 65px; height: 65px;
      background: radial-gradient(circle at 30% 30%, #d3d3d3, #a9a9a9);
      bottom: 40%; left: 8%;
      animation-delay: 4s;
    }
    .mineral {
      width: 40px; height: 40px;
      background: radial-gradient(circle at 30% 30%, #228b22, #006400);
      top: 40%; left: 50%;
      animation-delay: 5s;
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }

    .element {
      position: absolute;
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
      box-shadow: 0 0 15px rgba(255, 107, 0, 0.3);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(180deg); }
    }

    .text-overlay {
      position: absolute;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 800px;
      padding: 30px;
      background: linear-gradient(135deg, rgba(139, 69, 19, 0.2), rgba(255, 107, 0, 0.15));
      border: 2px solid rgba(255, 191, 0, 0.4);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(255, 107, 0, 0.2);
      text-align: center;
      font-size: 1.1em;
      line-height: 1.6;
      opacity: 0;
      animation: textFadeIn ${texts.length * 5}s infinite forwards;
      z-index: 20;
      max-height: 70vh;
      overflow: hidden;
      color: #e6e6e6;
    }

    .text-overlay::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #ffbf00, #8b4513, #ff4500, #ffbf00);
      border-radius: 20px;
      z-index: -1;
      animation: borderGlow 3s linear infinite;
    }

    @keyframes borderGlow {
      0% { opacity: 0.5; }
      50% { opacity: 0.8; }
      100% { opacity: 0.5; }
    }

    .text-overlay h1 {
      font-size: 2.2em;
      font-weight: 700;
      margin-bottom: 20px;
      color: #ffbf00;
      text-shadow: 0 0 10px rgba(255, 191, 0, 0.5);
    }

    .text-overlay p {
      margin-bottom: 12px;
      color: #e6e6e6;
      text-shadow: 0 0 5px rgba(230, 230, 230, 0.3);
    }

    .text-overlay::after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 15px 20px 15px 0;
      border-color: transparent rgba(255, 191, 0, 0.2) transparent transparent;
      left: -18px;
      top: 50%;
      transform: translateY(-50%);
      filter: drop-shadow(0 0 5px rgba(255, 191, 0, 0.3));
      z-index: -1;
    }

    .nurm-character-img {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80vw;
      max-width: 700px;
      height: auto;
      object-fit: contain;
      animation: explorerFloat 4s ease-in-out infinite alternate;
      z-index: 25;
      filter: drop-shadow(0 0 30px rgba(255, 107, 0, 0.4));
    }

    @keyframes explorerFloat {
      0% { 
        transform: translateY(0) translateX(-50%) rotate(-2deg); 
        filter: drop-shadow(0 0 30px rgba(255, 107, 0, 0.4));
      }
      50% { 
        transform: translate translateY(-20px) translateX(-50%) rotate(2deg);
        filter: drop-shadow(0 0 40px rgba(255, 69, 0, 0.4));
      }
      100% { 
        transform: translateY(0) translateX(-50%) rotate(-2deg);
        filter: drop-shadow(0 0 30px rgba(255, 107, 0, 0.4));
      }
    }

    .tectonic-effect {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, transparent 20%, rgba(255, 69, 0, 0.1) 50%, transparent 80%);
      opacity: 0;
      animation: tectonicShift 8s infinite ease-in-out;
      z-index: 5;
      pointer-events: none;
    }

    @keyframes tectonicShift {
      0%, 100% { opacity: 0; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.05); }
    }

    @media (min-width: 769px) {
      .text-overlay {
        width: 45%;
        font-size: 1.3em;
        padding: 40px;
        left: 65%;
      }
      .text-overlay h1 {
        font-size: 2.5em;
      }
      .nurm-character-img {
        width: 40vw;
        max-width: 600px;
        bottom: 0;
        left: -5%;
        transform: translateX(0);
      }
      @keyframes explorerFloat {
        0% { 
          transform: translateY(0) rotate(-2deg);
          filter: drop-shadow(0 0 30px rgba(255, 107, 0, 0.4));
        }
        50% { 
          transform: translateY(-25px) rotate(2deg);
          filter: drop-shadow(0 0 40px rgba(255, 69, 0, 0.4));
        }
        100% { 
          transform: translateY(0) rotate(-2deg);
          filter: drop-shadow(0 0 30px rgba(255, 107, 0, 0.4));
        }
      }
    }

    @media (max-width: 768px) {
      .text-overlay {
        width: 85%;
        top: 8%;
        font-size: 1.1em;
        padding: 25px;
        left: 50%;
      }
      .text-overlay h1 {
        font-size: 2em;
      }
      .nurm-character-img {
        width: 60vw;
        max-width: 500px;
        bottom: -5%;
        left: -5%;
        transform: translateX(0);
      }
    }

    @media (max-width: 480px) {
      .text-overlay {
        width: 90%;
        top: 5%;
        font-size: 0.9em;
        padding: 20px;
        left: 50%;
      }
      .text-overlay h1 {
        font-size: 1.8em;
      }
      .text-overlay::after {
        border-width: 20px 15px 0 15px;
        border-color: rgba(255, 191, 0, 0.2) transparent transparent transparent;
        left: 50%;
        bottom: -20px;
        transform: translateX(-50%);
      }
      .nurm-character-img {
        width: 95vw;
        max-width: 550px;
        bottom: -10%;
        left: 50%;
        transform: translateX(-50%);
      }
      @keyframes explorerFloat {
        0% { 
          transform: translateY(0) translateX(-50%) rotate(-2deg);
          filter: drop-shadow(0 0 20px rgba(255, 107, 0, 0.4));
        }
        50% { 
          transform: translateY(-20px) translateX(-50%) rotate(2deg);
          filter: drop-shadow(0 0 30px rgba(255, 69, 0, 0.4));
        }
        100% { 
          transform: translateY(0) translateX(-50%) rotate(-2deg);
          filter: drop-shadow(0 0 20px rgba(255, 107, 0, 0.4));
        }
      }
    }

    .skip-button {
      position: absolute;
      bottom: 30px;
      right: 30px;
      padding: 12px 24px;
      background: linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(139, 69, 19, 0.2));
      border: 2px solid rgba(255, 191, 0, 0.5);
      color: #ffbf00;
      font-weight: 600;
      border-radius: 25px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
      transition: all 0.3s ease;
      z-index: 30;
      font-family: 'Cinzel', serif;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .skip-button:hover {
      background: linear-gradient(135deg, rgba(255, 107, 0, 0.3), rgba(139, 69, 19, 0.3));
      box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
      transform: translateY(-2px);
    }

    @media (max-width: 480px) {
      .skip-button {
        bottom: 15px;
        right: 15px;
        padding: 10px 20px;
        font-size: 0.9em;
      }
    }

    @keyframes textFadeIn {
      0% { opacity: 0; transform: translateX(-50%) scale(0.9); }
      5% { opacity: 1; transform: translateX(-50%) scale(1); }
      15% { opacity: 1; transform: translateX(-50%) scale(1); }
      20% { opacity: 0; transform: translateX(-50%) scale(0.9); }
      25% { opacity: 0; transform: translateX(-50%) scale(0.9); }
      30% { opacity: 1; transform: translateX(-50%) scale(1); }
      45% { opacity: 1; transform: translateX(-50%) scale(1); }
      50% { opacity: 0; transform: translateX(-50%) scale(0.9); }
      55% { opacity: 0; transform: translateX(-50%) scale(0.9); }
      60% { opacity: 1; transform: translateX(-50%) scale(1); }
      75% { opacity: 1; transform: translateX(-50%) scale(1); }
      80% { opacity: 0; transform: translateX(-50%) scale(0.9); }
      85% { opacity: 0; transform: translateX(-50%) scale(0.9); }
      90% { opacity: 1; transform: translateX(-50%) scale(1); }
      100% { opacity: 1; transform: translateX(-50%) scale(1); }
    }
  `;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);

    let textInterval = setInterval(() => {
      setCurrentTextIndex(prevIndex => (prevIndex + 1) % texts.length);
    }, textDuration);

    return () => {
      clearInterval(textInterval);
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, [textDuration, texts.length]);

  return (
    <div className="container">
      <div className="mineral-particles">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      <div className="geological-elements">
        <div className="element rock"></div>
        <div className="element crystal"></div>
        <div className="element lava"></div>
        <div className="element soil"></div>
        <div className="element fossil"></div>
        <div className="element mineral"></div>
      </div>

      <div className="text-overlay" dangerouslySetInnerHTML={{ __html: texts[currentTextIndex] }}></div>

      <img
        src="images/misi-1.png"
        alt="NurM si Penjelajah Geologis"
        className="nurm-character-img"
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src="https://placehold.co/400x400/4b2e1a/ffbf00?text=⛏️+NurM+Explorer"; 
        }}
      />

      <div className="tectonic-effect"></div>

      <button onClick={onFinish} className="skip-button">
        ⛏️ Lewati
      </button>
    </div>
  );
};

export default SplashScreen;