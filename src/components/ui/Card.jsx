import { motion } from "framer-motion";
import clsx from "clsx";

export function Card({ children, className = "", animate = false, variant = "solid", ...rest }) {
  const base = clsx(
    "rounded-3xl p-6",
    variant === "solid"  && "bg-white border border-sky-100 shadow-sm shadow-sky-100/60",
    variant === "glass"  && "card-surface",
    variant === "inset"  && "bg-sky-50/60 border border-sky-100",
    variant === "cyan"   && "bg-cyan-50 border border-cyan-200",
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
      >{children}</motion.div>
    );
  }
  return <div className={base} {...rest}>{children}</div>;
}
