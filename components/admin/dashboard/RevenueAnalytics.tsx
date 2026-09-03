"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RevenueAnalytics.module.css";
import { ChevronDownIcon, DownloadIcon, EyeIcon, PrintIcon } from "./icons";

type PeriodId = "7d" | "30d" | "6m" | "12m";

type Period = { id: PeriodId; label: string };

const PERIODS: Period[] = [
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "6m", label: "Last 6 Months" },
  { id: "12m", label: "Last 12 Months" },
];

export type RevenuePoint = { label: string; value: number };

const FOOTER_TEXT: Record<PeriodId, string> = {
  "7d": "Daily revenue for the past week",
  "30d": "Weekly revenue for the past 8 weeks",
  "6m": "Monthly revenue for the past 6 months",
  "12m": "Monthly revenue for the past 12 months",
};

type RevenueAnalyticsProps = {
  dailyData: RevenuePoint[];
  weeklyData: RevenuePoint[];
  monthlyData: RevenuePoint[];
  error?: string | null;
};

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-US")}`;
}

/** Compact axis label, e.g. ₱5k, ₱1.25M. */
function formatCompactPeso(value: number): string {
  if (value >= 1_000_000) {
    return `₱${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `₱${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `₱${value}`;
}

export default function RevenueAnalytics({
  dailyData,
  weeklyData,
  monthlyData,
  error: initialError,
}: RevenueAnalyticsProps) {
  const [period, setPeriod] = useState<Period>(PERIODS[0]);
  const [open, setOpen] = useState(false);
  const [showValues, setShowValues] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const data =
    period.id === "7d"
      ? dailyData
      : period.id === "30d"
        ? weeklyData
        : monthlyData;

  // Chart scale is derived from the real series so bars always fit the plot.
  const rawMax = data.reduce((max, point) => Math.max(max, point.value), 0);
  const yMax = Math.max(1000, Math.ceil(rawMax / 1000) * 1000);
  const ySteps = Array.from({ length: 10 }, (_, index) => (10 - index) / 10);
  // Bars keep a consistent visual rhythm while staying proportional.
  const barWidth = (100 / Math.max(data.length, 1)) * 0.8;
  const error = actionError ?? initialError ?? null;

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectPeriod = (next: Period) => {
    setPeriod(next);
    setOpen(false);
  };

  const handleExport = () => {
    const rows = [
      ["Period", "Revenue"],
      ...data.map((point) => [point.label, String(point.value)]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenue-${period.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className={styles.analytics} aria-label="Revenue analytics">
      <header className={styles.header}>
        <h2 className={styles.title}>Revenue Analytics</h2>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.printButton}
            onClick={() => window.print()}
            aria-label="Print report"
            title="Print report"
          >
            <PrintIcon size={18} />
          </button>

          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              type="button"
              className={styles.dropdownTrigger}
              onClick={() => setOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <span>{period.label}</span>
              <ChevronDownIcon
                size={16}
                className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
              />
            </button>

            {open ? (
              <div className={styles.menu} role="menu">
                {PERIODS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitem"
                    className={`${styles.option} ${
                      option.id === period.id ? styles.optionActive : ""
                    }`}
                    onClick={() => selectPeriod(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className={styles.chart}>
        <div className={styles.chartBody}>
          <div className={styles.yAxis}>
            {ySteps.map((fraction, index) => (
              <span
                key={fraction}
                className={styles.yLabel}
                style={{ top: `${index * 10}%` }}
              >
                {formatCompactPeso(yMax * fraction)}
              </span>
            ))}
          </div>

          <div className={styles.chartMain}>
            <div className={styles.plot}>
              {ySteps.map((fraction, index) => (
                <span
                  key={fraction}
                  className={styles.hGrid}
                  style={{ top: `${index * 10}%` }}
                />
              ))}

              <div className={styles.bars}>
                {data.map((point, index) => (
                  <div
                    key={`${point.label}-${index}`}
                    className={styles.barGroup}
                    style={{ width: `${barWidth}%` }}
                  >
                    <span className={styles.vGrid} aria-hidden="true" />
                    <div
                      className={styles.bar}
                      style={{
                        height: `${Math.min(100, (point.value / yMax) * 100)}%`,
                      }}
                    >
                      {showValues ? (
                        <span className={styles.barValue}>
                          {formatPeso(point.value)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.xAxis}>
              {data.map((point, index) => (
                <span
                  key={`${point.label}-${index}`}
                  className={styles.xLabel}
                  style={{ width: `${barWidth}%` }}
                >
                  {point.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          {error ?? FOOTER_TEXT[period.id]}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.outlineButton}
            onClick={() => setShowValues((value) => !value)}
          >
            <EyeIcon size={16} />
            <span>View Exact Numbers</span>
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleExport}
          >
            <DownloadIcon size={16} />
            <span>Export to CSV</span>
          </button>
        </div>
      </footer>
    </section>
  );
}