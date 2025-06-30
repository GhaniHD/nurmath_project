import React, { useState, useEffect } from 'react';
import './SplashScreen.css'; // Pastikan jalur ini sesuai (misalnya, ../styles/SplashScreen.css jika CSS di folder styles)

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

  useEffect(() => {
    console.log('SplashScreen mounted. Starting text interval.');
    const styleSheets = document.styleSheets;
    console.log('Number of stylesheets:', styleSheets.length);
    for (let sheet of styleSheets) {
      console.log('Stylesheet href:', sheet.href);
    }

    let textInterval = setInterval(() => {
      setCurrentTextIndex(prevIndex => {
        console.log('Current text index:', prevIndex + 1);
        return (prevIndex + 1) % texts.length;
      });
    }, textDuration);

    return () => {
      console.log('SplashScreen unmounted. Cleaning up.');
      clearInterval(textInterval);
    };
  }, [textDuration, texts.length]);

  return (
    <div className="container">
      <div className="text-overlay" style={{ opacity: 1 }}> {/* Override opacity untuk memastikan visibilitas */}
        <div dangerouslySetInnerHTML={{ __html: texts[currentTextIndex] }} />
      </div>

      <img
        src="/images/misi-1.png"
        alt="NurM si Penjelajah Geologis"
        className="nurm-character-img"
        onError={(e) => {
          console.error('Image failed to load:', e.target.src);
          e.target.src = "https://placehold.co/400x400/4b2e1a/ffbf00?text=⛏️+NurM+Explorer";
        }}
        onLoad={() => console.log('Image loaded successfully:', '/images/misi-1.png')}
      />

      <button
        onClick={() => {
          console.log('Skip button clicked.');
          onFinish();
        }}
        className="skip-button"
      >
        ⛏️ Lewati
      </button>
    </div>
  );
};

export default SplashScreen;