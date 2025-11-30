import React, { useMemo } from "react";

function splitContent(text, by) {
  if (by === "word") {
    return text.split(/(\s+)/);
  }
  return text.split("");
}

export function TextAnimate({ children, by = "character", animation = "blurInUp", stagger = 0.04, initialDelay = 0, className = "" }) {
  const raw = typeof children === "string" ? children : String(children ?? "");
  const content = raw.replace(/\s+/g, " ").trim();
  const items = useMemo(() => splitContent(content, by), [content, by]);

  return (
    <span className={`text-animate ${className}`.trim()}>
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`text-animate__item ${animation}`}
          style={{ animationDelay: `${initialDelay + index * stagger}s` }}
        >
          {item === " " ? "\u00a0" : item}
        </span>
      ))}
    </span>
  );
}
