import React, { useState, useEffect } from 'react';

// Komponen SplashScreen akan menerima prop 'onFinish'
// yang akan dipanggil ketika splash screen selesai atau dilewati.
const SplashScreen = ({ onFinish }) => {
    // Array of text content for the splash screen
    const texts = [        `<h1>🚀 Selamat Datang di Galaksi NurMath!</h1>        <p>🌌 "Di antara bintang-bintang, pengetahuan adalah kompas terbaik."</p>`,        `<p>Galaksi NurMath dahulu bersinar terang, dijaga oleh enam planet pengetahuan:</p>        <p><strong>🪨 Planet Batuan Ilmu, 🌍 Planet Data Bumi, 🌊 Planet Lautan Fakta, 📊 Planet Diagram, ☁️ Nebula Informasi, dan 🌌 Dimensi Representasi.</strong></p>`,        `<p>Namun tiba-tiba, badai kosmik gelap menyapu seluruh galaksi, menghancurkan jalur komunikasi antar planet dan memecah diagram navigasi kosmik.</p>        <p>⚡ Kini, Galaksi NurMath terancam kehilangan cahayanya selamanya.</p>`,        `<p>Satu-satunya harapan ada pada <strong>NurM si Astronaut Penjelajah</strong>, yang dengan pesawat luar angkasanya siap mengarungi galaksi untuk mengembalikan keseimbangan.</p>        <p>🚀 Tapi perjalanan ini terlalu berbahaya untuk dilakukan sendirian…</p>        <hr class="my-4">        <p class="text-xl font-bold">🌟 Ayo bergabung dengan NurM dalam Misi Penyelamatan Galaksi!</p>        <p>Kamu akan menjelajahi setiap planet, menyelesaikan puzzle kosmik dan tantangan matematika yang akan menguji kemampuan logika dan kreativitasmu!</p>`    ];

    // State to manage the current text being displayed
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    // Duration for each text segment in milliseconds
    const textDuration = 5000;

    // CSS for animations and global styles (injected dynamically)
    const globalStyles = `
        body {
            font-family: 'Space Grotesk', 'Inter', sans-serif;
            overflow: hidden;
            background: radial-gradient(ellipse at center, #0f0f23 0%, #1a1a2e 30%, #16213e 60%, #0f0f23 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            width: 100vw;
        }

        /* Hide scrollbars globally */
        * {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        
        *::-webkit-scrollbar {
            display: none; /* WebKit */
        }

        .container {
            position: relative;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(ellipse at center, #0f0f23 0%, #1a1a2e 30%, #16213e 60%, #0f0f23 100%);
            overflow: hidden;
            box-sizing: border-box;
        }

        /* Animated Stars Background */
        .stars {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        .star {
            position: absolute;
            background: white;
            border-radius: 50%;
            animation: twinkle 2s infinite alternate;
        }

        .star:nth-child(1) { top: 10%; left: 20%; width: 2px; height: 2px; animation-delay: 0s; }
        .star:nth-child(2) { top: 15%; left: 80%; width: 1px; height: 1px; animation-delay: 0.5s; }
        .star:nth-child(3) { top: 25%; left: 10%; width: 3px; height: 3px; animation-delay: 1s; }
        .star:nth-child(4) { top: 35%; left: 70%; width: 2px; height: 2px; animation-delay: 1.5s; }
        .star:nth-child(5) { top: 45%; left: 30%; width: 1px; height: 1px; animation-delay: 2s; }
        .star:nth-child(6) { top: 55%; left: 85%; width: 2px; height: 2px; animation-delay: 0.3s; }
        .star:nth-child(7) { top: 65%; left: 15%; width: 1px; height: 1px; animation-delay: 0.8s; }
        .star:nth-child(8) { top: 75%; left: 60%; width: 3px; height: 3px; animation-delay: 1.3s; }
        .star:nth-child(9) { top: 85%; left: 40%; width: 2px; height: 2px; animation-delay: 1.8s; }
        .star:nth-child(10) { top: 5%; left: 50%; width: 1px; height: 1px; animation-delay: 2.3s; }
        .star:nth-child(11) { top: 20%; left: 95%; width: 2px; height: 2px; animation-delay: 0.2s; }
        .star:nth-child(12) { top: 40%; left: 5%; width: 1px; height: 1px; animation-delay: 0.7s; }
        .star:nth-child(13) { top: 60%; left: 90%; width: 3px; height: 3px; animation-delay: 1.2s; }
        .star:nth-child(14) { top: 80%; left: 25%; width: 2px; height: 2px; animation-delay: 1.7s; }
        .star:nth-child(15) { top: 90%; left: 75%; width: 1px; height: 1px; animation-delay: 2.2s; }

        @keyframes twinkle {
            0% { opacity: 0.3; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.2); }
        }

        /* Floating Planets */
        .floating-planet {
            position: absolute;
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
            z-index: 2;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }

        .planet-rock { 
            width: 60px; height: 60px; 
            background: radial-gradient(circle at 30% 30%, #d4af37, #b8860b);
            top: 15%; left: 10%;
            animation-delay: 0s;
        }
        .planet-earth { 
            width: 50px; height: 50px; 
            background: radial-gradient(circle at 30% 30%, #4169e1, #1e90ff);
            top: 25%; right: 15%;
            animation-delay: 1s;
        }
        .planet-ocean { 
            width: 45px; height: 45px; 
            background: radial-gradient(circle at 30% 30%, #00ced1, #4682b4);
            bottom: 20%; left: 15%;
            animation-delay: 2s;
        }
        .planet-diagram { 
            width: 55px; height: 55px; 
            background: radial-gradient(circle at 30% 30%, #32cd32, #228b22);
            top: 60%; right: 10%;
            animation-delay: 3s;
        }
        .planet-nebula { 
            width: 65px; height: 65px; 
            background: radial-gradient(circle at 30% 30%, #da70d6, #ba55d3);
            bottom: 40%; left: 8%;
            animation-delay: 4s;
        }
        .planet-dimension { 
            width: 40px; height: 40px; 
            background: radial-gradient(circle at 30% 30%, #ff6347, #dc143c);
            top: 40%; left: 50%;
            animation-delay: 5s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

        /* Text Overlay with Holographic Effect */
        .text-overlay {
            position: absolute;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 800px;
            padding: 30px;
            background: linear-gradient(135deg, 
                rgba(0, 255, 255, 0.1) 0%, 
                rgba(138, 43, 226, 0.15) 50%, 
                rgba(0, 191, 255, 0.1) 100%);
            border: 2px solid rgba(0, 255, 255, 0.3);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 
                0 8px 32px rgba(0, 255, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            text-align: center;
            font-size: 1.1em;
            line-height: 1.6;
            opacity: 0;
            animation: textFadeIn ${texts.length * 5}s infinite forwards;
            z-index: 20;
            max-height: 70vh;
            overflow: hidden;
            color: #ffffff;
        }

        .text-overlay::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #00ffff, #8a2be2, #00bfff, #00ffff);
            border-radius: 20px;
            z-index: -1;
            animation: borderGlow 3s linear infinite;
        }

        @keyframes borderGlow {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }

        .text-overlay h1 {
            font-size: 2.2em;
            font-weight: 700;
            margin-bottom: 20px;
            color: #00ffff;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .text-overlay p {
            margin-bottom: 12px;
            color: #e6f3ff;
            text-shadow: 0 0 5px rgba(230, 243, 255, 0.3);
        }

        /* Holographic Speech Tail */
        .text-overlay::after {
            content: '';
            position: absolute;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 15px 20px 15px 0;
            border-color: transparent rgba(0, 255, 255, 0.2) transparent transparent;
            left: -18px;
            top: 50%;
            transform: translateY(-50%);
            filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.3));
            z-index: -1;
        }

        /* NurM Astronaut Character */
        .nurm-character-img {
            position: absolute;
            bottom: -5%;
            left: 50%;
            transform: translateX(-50%);
            width: 80vw;
            max-width: 700px;
            height: auto;
            object-fit: contain;
            animation: astronautFloat 4s ease-in-out infinite alternate;
            z-index: 25;
            filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.4));
        }

        @keyframes astronautFloat {
            0% { 
                transform: translateY(0) translateX(-50%) rotate(-2deg); 
                filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.4));
            }
            50% { 
                transform: translateY(-25px) translateX(-50%) rotate(2deg);
                filter: drop-shadow(0 0 40px rgba(138, 43, 226, 0.4));
            }
            100% { 
                transform: translateY(0) translateX(-50%) rotate(-2deg);
                filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.4));
            }
        }

        /* Cosmic Storm Effect */
        .cosmic-storm {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, transparent 20%, rgba(138, 43, 226, 0.1) 50%, transparent 80%);
            opacity: 0;
            animation: cosmicStorm 8s infinite ease-in-out;
            z-index: 5;
            pointer-events: none;
        }

        @keyframes cosmicStorm {
            0%, 100% { opacity: 0; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
        }

        /* Responsive Design */
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
                bottom: 0%; /* Changed from -5% to 0% to move it higher */
                left: -5%;
                transform: translateX(0);
            }
            @keyframes astronautFloat {
                0% { 
                    transform: translateY(0) rotate(-2deg);
                    filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.4));
                }
                50% { 
                    transform: translateY(-25px) rotate(2deg);
                    filter: drop-shadow(0 0 40px rgba(138, 43, 226, 0.4));
                }
                100% { 
                    transform: translateY(0) rotate(-2deg);
                    filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.4));
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
                border-color: rgba(0, 255, 255, 0.2) transparent transparent transparent;
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
            @keyframes astronautFloat {
                0% { 
                    transform: translateY(0) translateX(-50%) rotate(-2deg);
                    filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.4));
                }
                50% { 
                    transform: translateY(-20px) translateX(-50%) rotate(2deg);
                    filter: drop-shadow(0 0 30px rgba(138, 43, 226, 0.4));
                }
                100% { 
                    transform: translateY(0) translateX(-50%) rotate(-2deg);
                    filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.4));
                }
            }
        }

        /* Skip Button with Futuristic Design */
        .skip-button {
            position: absolute;
            bottom: 30px;
            right: 30px;
            padding: 12px 24px;
            background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(138, 43, 226, 0.2));
            border: 2px solid rgba(0, 255, 255, 0.5);
            color: #00ffff;
            font-weight: 600;
            border-radius: 25px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
            transition: all 0.3s ease;
            z-index: 30;
            font-family: 'Space Grotesk', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .skip-button:hover {
            background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(138, 43, 226, 0.3));
            box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
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

        /* Keyframe for text fade in/out */
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

    // useEffect to handle text cycling
    useEffect(() => {
        // Inject global styles
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = globalStyles;
        document.head.appendChild(styleSheet);

        let textInterval;

        // Start text cycling animation
        textInterval = setInterval(() => {
            setCurrentTextIndex(prevIndex => (prevIndex + 1) % texts.length);
        }, textDuration);

        // Cleanup function for useEffect
        return () => {
            clearInterval(textInterval);
            if (document.head.contains(styleSheet)) {
                document.head.removeChild(styleSheet);
            }
        };
    }, [textDuration, texts.length]);

    return (
        <div className="container">
            {/* Animated Stars Background */}
            <div className="stars">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="star"></div>
                ))}
            </div>

            {/* Floating Planets */}
            <div className="floating-planet planet-rock"></div>
            <div className="floating-planet planet-earth"></div>
            <div className="floating-planet planet-ocean"></div>
            <div className="floating-planet planet-diagram"></div>
            <div className="floating-planet planet-nebula"></div>
            <div className="floating-planet planet-dimension"></div>

            {/* Text Overlay (Holographic Pop-up) */}
            <div className="text-overlay" dangerouslySetInnerHTML={{ __html: texts[currentTextIndex] }}></div>

            {/* NurM Astronaut Character */}
            <img
                src="/images/karakter.png"
                alt="NurM si Astronaut Penjelajah"
                className="nurm-character-img"
                onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src="https://placehold.co/400x400/1a1a2e/00ffff?text=🚀+NurM+Astronaut"; 
                }}
            />

            {/* Cosmic Storm Effect */}
            <div className="cosmic-storm"></div>

            {/* Skip button with futuristic design */}
            <button
                onClick={onFinish}
                className="skip-button"
            >
                🚀 Lewati
            </button>
        </div>
    );
};

export default SplashScreen;