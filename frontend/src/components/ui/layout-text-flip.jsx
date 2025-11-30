import { useEffect, useMemo, useState } from "react";

function LayoutTextFlip({ text, words = [], intervalMs = 2200 }) {
  const safeWords = useMemo(() => (Array.isArray(words) && words.length ? words : []), [words]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeWords.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % safeWords.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [safeWords, intervalMs]);

  const currentWord = safeWords.length ? safeWords[index % safeWords.length] : "";

  return (
    <div className="layout-flip">
      {text ? <span className="layout-flip__prefix">{text}</span> : null}
      {currentWord ? (
        <span key={currentWord} className="layout-flip__word">
          {currentWord}
        </span>
      ) : null}
    </div>
  );
}

export default LayoutTextFlip;
