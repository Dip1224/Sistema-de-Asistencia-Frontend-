// use client
import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "motion/react";

const CircleCursor = () => (
  <div
    aria-hidden="true"
    style={{
      width: 26,
      height: 26,
      borderRadius: "999px",
      background: "radial-gradient(circle, #f5f5f5 0%, #cbd5f5 70%, #0b0b0b 100%)",
      boxShadow: "0 8px 18px rgba(0, 0, 0, 0.25)",
      mixBlendMode: "difference",
      pointerEvents: "none"
    }}
  />
);

function SmoothCursor({
  cursor = <CircleCursor />,
  springConfig = { damping: 45, stiffness: 400, mass: 1, restDelta: 0.001 }
}) {
  const [enabled, setEnabled] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);
  const timeoutRef = useRef(null);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, { ...springConfig, damping: 60, stiffness: 300 });
  const scale = useSpring(1, { ...springConfig, stiffness: 500, damping: 35 });

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const update = event => setEnabled(!event.matches);
    setEnabled(!media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.body.style.cursor = "auto";
      return undefined;
    }

    function updateVelocity(currentPos) {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;
      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime
        };
      }
      lastUpdateTime.current = currentTime;
      lastMousePos.current = currentPos;
    }

    function smoothMouseMove(e) {
      const currentPos = { x: e.clientX, y: e.clientY };
      updateVelocity(currentPos);

      const speed = Math.hypot(velocity.current.x, velocity.current.y);
      cursorX.set(currentPos.x);
      cursorY.set(currentPos.y);

      if (speed > 0.1) {
        const currentAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90;
        let angleDiff = currentAngle - previousAngle.current;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        accumulatedRotation.current += angleDiff;
        rotation.set(accumulatedRotation.current);
        previousAngle.current = currentAngle;

        scale.set(0.95);
        setIsMoving(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          scale.set(1);
          setIsMoving(false);
        }, 150);
      }
    }

    let rafId = 0;
    function throttledMouseMove(e) {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        smoothMouseMove(e);
        rafId = 0;
      });
    }

    document.documentElement.classList.add("custom-cursor-active");
    document.body.style.cursor = "none";
    window.addEventListener("mousemove", throttledMouseMove);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      document.body.style.cursor = "auto";
      document.documentElement.classList.remove("custom-cursor-active");
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [cursorX, cursorY, enabled, rotation, scale]);

  if (!enabled) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: rotation,
        scale: scale,
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform"
      }}
      initial={{ scale: 0 }}
      animate={{ scale: isMoving ? 1 : 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
    >
      {cursor}
    </motion.div>
  );
}

export default SmoothCursor;
