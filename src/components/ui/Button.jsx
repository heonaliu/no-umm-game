/**
 * Button — reusable themed button with Framer Motion press animation.
 *
 * Variants: primary | secondary | danger | ghost
 * Sizes:    sm | md | lg | xl
 */

import { motion } from "framer-motion";
import clsx from "clsx";

const variants = {
  primary:   "bg-violet-600 hover:bg-violet-500 text-white border-2 border-violet-400 shadow-lg shadow-violet-900/40",
  secondary: "bg-white/10 hover:bg-white/20 text-white border-2 border-white/20",
  danger:    "bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 shadow-lg shadow-red-900/40",
  ghost:     "bg-transparent hover:bg-white/10 text-white/70 hover:text-white border-2 border-transparent",
  success:   "bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-900/40",
};

const sizes = {
  sm:  "px-3 py-1.5 text-sm rounded-lg",
  md:  "px-5 py-2.5 text-base rounded-xl",
  lg:  "px-7 py-3.5 text-lg rounded-2xl",
  xl:  "px-10 py-5 text-2xl rounded-2xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...rest
}) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "font-display font-bold cursor-pointer transition-colors duration-150 select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
