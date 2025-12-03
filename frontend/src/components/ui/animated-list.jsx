"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/utils.js";

export function AnimatedListItem({ children }) {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 40 }
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}

export const AnimatedList = React.memo(function AnimatedList({ children, className = "", delay = 1000, ...props }) {
  const [index, setIndex] = useState(0);
  const childrenArray = useMemo(() => React.Children.toArray(children), [children]);

  useEffect(() => {
    if (index < childrenArray.length - 1) {
      const timeout = setTimeout(() => {
        setIndex(prevIndex => (prevIndex + 1) % childrenArray.length);
      }, delay);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [index, delay, childrenArray.length]);

  const itemsToShow = useMemo(() => {
    const result = childrenArray.slice(0, index + 1).reverse();
    return result;
  }, [index, childrenArray]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)} {...props}>
      <AnimatePresence>
        {itemsToShow.map((item, idx) => {
          const key = item?.key ?? idx;
          return <AnimatedListItem key={key}>{item}</AnimatedListItem>;
        })}
      </AnimatePresence>
    </div>
  );
});

AnimatedList.displayName = "AnimatedList";
