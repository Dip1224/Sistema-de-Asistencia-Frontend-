// use client
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function applyTheme(isDark) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function AnimatedThemeToggler({ className = "", duration = 400, ...props }) {
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const initial = stored ? stored === "dark" : prefersDark;
    applyTheme(initial);
    setIsDark(initial);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(async () => {
    const target = buttonRef.current;
    const next = !isDark;

    const vt =
      document.startViewTransition?.(() => {
        flushSync(() => {
          applyTheme(next);
          setIsDark(next);
        });
      }) || { ready: Promise.resolve() };

    try {
      await vt.ready;
    } catch (err) {
      applyTheme(next);
      setIsDark(next);
      return;
    }

    if (!target || !document.documentElement.animate) return;
    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`]
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)"
      }
    );
  }, [isDark, duration]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn("theme-toggle", className)}
      type="button"
      {...props}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export default AnimatedThemeToggler;
