/** Card — white rounded card with subtle indigo shadow. */

import { motion } from "framer-motion";
import clsx from "clsx";

export function Card({ children, className = "", animate = false, variant = "solid", ...rest }) {
  const base = clsx(
    "rounded-3xl p-6",
    variant === "solid"  && "bg-white border border-indigo-100 shadow-sm shadow-indigo-100/60",
    variant === "glass"  && "card-surface",
    variant === "inset"  && "bg-indigo-50/60 border border-indigo-100",
    variant === "violet" && "bg-violet-50 border border-violet-200",
    className
  );

  if (animate) {
    return (
      <motion.div
        className={base}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={base} {...rest}>{children}</div>;
}
