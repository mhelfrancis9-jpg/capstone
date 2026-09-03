import { useState } from "react";
import type { CategoryRow } from "@/lib/data/types";
import { getCategoryNote } from "./categoryConfig";
import styles from "./CategoryPicker.module.css";

interface CategoryPickerProps {
  value: string;
  onChange: (value: string) => void;
  categories: CategoryRow[];
  error?: string;
}

export function CategoryPicker({
  value,
  onChange,
  categories,
  error,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);

  const selected = categories.find((c) => c.id === value);
  const note = selected ? getCategoryNote(selected.slug) : "";

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Category</span>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="category-list"
        className={styles.trigger}
      >
        <span className={styles.triggerText}>
          <span className={styles.selectedName}>
            {selected?.name ?? "Select a category"}
          </span>
          {note && (
            <span className={styles.selectedNote}>{note}</span>
          )}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id="category-list"
          className={styles.dropdown}
        >
          {categories.length === 0 ? (
            <p className={styles.empty}>No categories available.</p>
          ) : (
            categories.map((category) => {
              const active = category.id === value;
              const catNote = getCategoryNote(category.slug);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onChange(category.id);
                    setOpen(false);
                  }}
                  aria-pressed={active}
                  className={`${styles.option} ${active ? styles.optionActive : ""}`}
                >
                  <span className={styles.optionName}>
                    {category.name}
                  </span>
                  {catNote && (
                    <span className={`${styles.optionNote} ${active ? styles.optionNoteActive : ""}`}>
                      {catNote}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
