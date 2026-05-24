import { motion } from "framer-motion";
import clsx from "clsx";

const variants = {
  primary:
    "bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white border border-sky-500 shadow-md shadow-sky-200",
  secondary:
    "bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 shadow-sm",
  danger:
    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border border-red-500 shadow-md shadow-red-200",
  ghost:
    "bg-transparent hover:bg-sky-50 text-sky-700 border border-transparent hover:border-sky-200",
  success:
    "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-500 shadow-md shadow-emerald-200",
  cyan:
    "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white border border-cyan-500 shadow-md shadow-cyan-200",
};

const sizes = {
  sm:  "px-3 py-1.5 text-sm  rounded-lg  gap-1.5",
  md:  "px-5 py-2.5 text-base rounded-xl gap-2",
  lg:  "px-6 py-3   text-lg  rounded-2xl gap-2",
  xl:  "px-8 py-4   text-xl  rounded-2xl gap-2.5",
};

export function Button({ children, variant = "primary", size = "md", className = "", disabled = false, onClick, type = "button", icon: Icon, ...rest }) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center font-display font-bold",
        "cursor-pointer transition-colors duration-150 select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant], sizes[size], className
      )}
      {...rest}
    >
      {Icon && <Icon size={size === "xl" ? 22 : size === "lg" ? 20 : 16} strokeWidth={2.5} />}
      {children}
    </motion.button>
  );
}
