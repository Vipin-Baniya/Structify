"use client";
import { useState } from "react";

export function Field({
  label, children, hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-muted mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-dim mt-1">{hint}</p>}
    </div>
  );
}

export function Input({
  value, onChange, placeholder, type = "text", required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors"
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors resize-none"
    />
  );
}

export function Select({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-green/40 transition-colors"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Toggle({
  label, value, onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer
          ${value ? "bg-green" : "bg-border"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
          ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-text">{label}</span>
    </label>
  );
}

export function TagInput({
  tags, onChange, placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [inputVal, setInputVal] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputVal.trim();
      if (val && !tags.includes(val)) onChange([...tags, val]);
      setInputVal("");
    }
    // Backspace removes last tag when input is empty
    if (e.key === "Backspace" && !inputVal && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 flex flex-wrap gap-1.5 min-h-[40px]">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 bg-card border border-border rounded px-2 py-0.5 text-xs text-muted">
          {t}
          <button
            type="button"
            onClick={() => onChange(tags.filter(x => x !== t))}
            className="text-dim hover:text-red-400 ml-0.5 leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? (placeholder || "Type and press Enter...") : ""}
        className="bg-transparent text-sm text-text outline-none flex-1 min-w-24"
      />
    </div>
  );
}

export function FormActions({
  loading, onCancel, submitLabel = "Save",
}: {
  loading: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 bg-green text-bg rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 border border-border text-muted rounded-lg text-sm hover:text-text transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
