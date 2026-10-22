"use client";

export function Section({ title, subtitle, children, defaultOpen = true }) {
  return (
    <details
      open={defaultOpen}
      className="group mb-4 rounded-xl border border-border-base bg-surface shadow-sm"
    >
      <summary className="cursor-pointer list-none select-none rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-on-surface">{title}</h2>
          {subtitle ? (
            <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
          ) : null}
        </div>
        <span className="text-on-surface-variant transition-transform group-open:rotate-180">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="px-5 pb-5 pt-1 border-t border-border-base">{children}</div>
    </details>
  );
}

export function Grid({ cols = 4, children }) {
  const colClass =
    cols === 1
      ? "grid-cols-1"
      : cols === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : cols === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  return <div className={`grid ${colClass} gap-4 mt-3`}>{children}</div>;
}

export function Field({ label, children, hint = null, span = false }) {
  return (
    <label className={`block text-sm ${span ? "sm:col-span-2 lg:col-span-2" : ""}`}>
      <span className="block text-xs font-medium text-on-surface-variant mb-1">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-on-surface-variant mt-0.5">{hint}</span> : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-border-base bg-surface px-3 py-2 text-sm text-on-surface " +
  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-on-surface-variant";

export function TextInput(props) {
  return <input {...props} className={`${inputBase} ${props.className || ""}`} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${inputBase} ${props.className || ""}`} rows={props.rows || 2} />;
}

export function Select({ options, ...props }) {
  return (
    <select {...props} className={`${inputBase} ${props.className || ""}`}>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function Button({ variant = "primary", className = "", ...props }) {
  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary disabled:bg-stone-300 disabled:text-on-surface-variant",
    ghost:
      "bg-surface-variant text-on-surface-variant hover:bg-surface-variant hover:bg-opacity-80",
    danger:
      "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    />
  );
}

export function RowCard({ children, onRemove, removeLabel = "Remove" }) {
  return (
    <div className="relative rounded-lg border border-border-base bg-surface-variant/50 p-3 pr-10 mb-2">
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="absolute top-2 right-2 text-on-surface-variant hover:text-red-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
