/**
 * Input — styled text input for forms.
 */

import clsx from "clsx";

export function Input({ className = "", label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-bold text-white/70 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3",
          "text-white placeholder:text-white/30 font-body text-base",
          "focus:outline-none focus:border-violet-400 focus:bg-white/15",
          "transition-all duration-150",
          error && "border-red-400 focus:border-red-400",
          className
        )}
        {...props}
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}
