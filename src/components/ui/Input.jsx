/** Input — light-theme styled text input. */

import clsx from "clsx";

export function Input({ className = "", label, error, icon: Icon, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest text-indigo-500">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300">
            <Icon size={18} />
          </span>
        )}
        <input
          className={clsx(
            "w-full rounded-xl border bg-white px-4 py-3",
            "text-indigo-950 placeholder:text-indigo-300 font-body text-base",
            "focus:outline-none focus:ring-2 transition-all duration-150",
            error
              ? "border-red-300 focus:ring-red-200"
              : "border-indigo-200 focus:border-indigo-400 focus:ring-indigo-100",
            Icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-red-500 text-xs flex items-center gap-1">{error}</span>}
    </div>
  );
}
