import { useEffect, useMemo, useState } from "react";

const DEFAULT_WORDS = ["marca tu entrada", "marca tu salida", "verifica tu asistencia"];

function LayoutTextFlip({ text, words = [], intervalMs = 2200 }) {
  const safeWords = useMemo(() => (Array.isArray(words) && words.length ? words : DEFAULT_WORDS), [words]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeWords.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % safeWords.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [safeWords, intervalMs]);

  const currentWord = safeWords[index % safeWords.length];

  return (
    <div className="layout-flip">
      {text ? <span className="layout-flip__prefix">{text}</span> : null}
      <span key={currentWord} className="layout-flip__word">
        {currentWord}
      </span>
    </div>
  );
}

function VerifyIntro() {
  return (
    <header className="verify-hero">
      <p className="register-subtitle">Verificacion rapida</p>
      <div className="verify-hero__title">
        <LayoutTextFlip text="Bienvenido," words={DEFAULT_WORDS} />
      </div>
      <p className="register-description verify-hero__lead">
        Marca tu entrada y salida aqui. Coloca tu rostro frente a la camara y espera la confirmacion de asistencia.
      </p>
    </header>
  );
}

export default VerifyIntro;
