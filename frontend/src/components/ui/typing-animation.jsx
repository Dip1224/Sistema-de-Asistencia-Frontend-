import React, { useEffect, useMemo, useState } from "react";

export function TypingAnimation({
  words = [],
  speed = 70,
  deleteSpeed = 45,
  pause = 1200,
  loop = true,
  className = ""
}) {
  const safeWords = useMemo(
    () => (Array.isArray(words) && words.length ? words : ["Sistema de Reconocimiento"]),
    [words]
  );
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = safeWords[index % safeWords.length];
    if (!currentWord) return undefined;

    if (!isDeleting && display === currentWord) {
      if (!loop) return undefined;
      const pauseId = setTimeout(() => setIsDeleting(true), pause);
      return () => clearTimeout(pauseId);
    }

    if (isDeleting && display === "") {
      const nextIndex = index + 1;
      if (!loop && nextIndex >= safeWords.length) return undefined;
      setIsDeleting(false);
      setIndex(nextIndex % safeWords.length);
      return undefined;
    }

    const timeout = setTimeout(() => {
      const nextText = isDeleting
        ? currentWord.slice(0, display.length - 1)
        : currentWord.slice(0, display.length + 1);
      setDisplay(nextText);
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [display, isDeleting, safeWords, index, speed, deleteSpeed, pause, loop]);

  return (
    <span className={`typing-animation ${className}`.trim()}>
      <span className="typing-animation__text">{display}</span>
      <span className="typing-animation__caret" />
    </span>
  );
}
