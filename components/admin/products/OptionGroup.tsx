import { useState } from "react";
import styles from "./OptionGroup.module.css";

interface OptionGroupProps {
  label: string;
  hint?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  values: string[];
  onChange: (values: string[]) => void;
  presets: string[];
  placeholder: string;
}

export function OptionGroup({
  label,
  hint,
  enabled,
  onToggle,
  values,
  onChange,
  presets,
  placeholder,
}: OptionGroupProps) {
  const [draft, setDraft] = useState("");
  const id = `opt-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;

  const togglePreset = (preset: string) => {
    onChange(
      values.includes(preset)
        ? values.filter((v) => v !== preset)
        : [...values, preset]
    );
  };

  const addCustom = () => {
    const value = draft.trim();
    if (!value || values.includes(value)) {
      setDraft("");
      return;
    }
    onChange([...values, value]);
    setDraft("");
  };

  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.toggleLabel}>
        <input
          id={id}
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className={styles.checkbox}
        />
        <span className={styles.labelText}>
          <span className={styles.label}>{label}</span>
          {hint && <span className={styles.hint}>{hint}</span>}
        </span>
      </label>

      {enabled && (
        <div className={styles.body}>
          <div className={styles.presets}>
            {presets.map((preset) => {
              const active = values.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => togglePreset(preset)}
                  aria-pressed={active}
                  className={`${styles.preset} ${active ? styles.presetActive : ""}`}
                >
                  {preset}
                </button>
              );
            })}

            {values
              .filter((v) => !presets.includes(v))
              .map((custom) => (
                <span key={custom} className={styles.customTag}>
                  {custom}
                  <button
                    type="button"
                    onClick={() =>
                      onChange(values.filter((v) => v !== custom))
                    }
                    aria-label={`Remove ${custom}`}
                    className={styles.removeTag}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </span>
              ))}
          </div>

          <div className={styles.addRow}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder={placeholder}
              aria-label={`Add a custom ${label} option`}
              className={styles.input}
            />
            <button
              type="button"
              onClick={addCustom}
              className={styles.addButton}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Add
            </button>
          </div>

          {values.length === 0 && (
            <p className={styles.warning}>
              Pick at least one {label.toLowerCase()} option.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
