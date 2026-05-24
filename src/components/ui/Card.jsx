/**
 * Card — glassmorphism card container used across all screens.
 */

import { motion } from "framer-motion";
import clsx from "clsx";

export function Card({ children, className = "", animate = false, ...rest }) {
  const Component = animate ? motion.div : "div";
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring", stiffness: 300, damping: 30 },
      }
    : {};

  return (
    <Component
      className={clsx(
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6",
        className
      )}
      {...animProps}
      {...rest}
    >
      {children}
    </Component>
  );
}
