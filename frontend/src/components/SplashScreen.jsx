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
    /* Same CSS as before, unchanged for brevity */
  `;

  useEffect(() => {
    console.log('SplashScreen mounted. Starting CSS injection and text interval.');

    // Check if Cinzel font is loaded
    document.fonts.ready.then(() => {
      if (document.fonts.check('1em Cinzel')) {
        console.log('Cinzel font loaded successfully.');
      } else {
        console.error('Cinzel font failed to load.');
      }
    }).catch((err) => {
      console.error('Font loading error:', err);
    });

    // Inject CSS
    try {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = globalStyles;
      document.head.appendChild(styleSheet);
      console.log('CSS styles injected successfully.');

      let textInterval = setInterval(() => {
        setCurrentTextIndex(prevIndex => {
          console.log('Current text index:', prevIndex + 1);
          return (prevIndex + 1) % texts.length;
        });
      }, textDuration);

      return () => {
        console.log('SplashScreen unmounted. Cleaning up.');
        clearInterval(textInterval);
        if (document.head.contains(styleSheet)) {
          document.head.removeChild(styleSheet);
          console.log('CSS styles removed.');
        }
      };
    } catch (err) {
      console.error('Error during CSS injection or interval setup:', err);
    }
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

      <div
        className="text-overlay"
        dangerouslySetInnerHTML={{ __html: texts[currentTextIndex] }}
        onError={() => console.error('Error rendering text-overlay HTML:', texts[currentTextIndex])}
      ></div>

      <img
        src="/images/misi-1.png" // Changed to absolute path assuming public folder
        alt="NurM si Penjelajah Geologis"
        className="nurm-character-img"
        onError={(e) => {
          console.error('Image failed to load:', e.target.src);
          e.target.src = "https://placehold.co/400x400/4b2e1a/ffbf00?text=⛏️+NurM+Explorer";
        }}
        onLoad={() => console.log('Image loaded successfully:', '/images/misi-1.png')}
      />

      <div className="tectonic-effect"></div>

      <button onClick={() => {
        console.log('Skip button clicked.');
        onFinish();
      }} className="skip-button">
        ⛏️ Lewati
      </button>
    </div>
  );
};

export default SplashScreen;