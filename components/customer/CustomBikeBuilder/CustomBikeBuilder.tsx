"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "../CartContext";
import { formatPeso, PRODUCT_PLACEHOLDER_SRC } from "../data";
import type {
  BuilderStep,
  BuilderProduct,
} from "@/lib/data/customer/bike-builder";
import styles from "./CustomBikeBuilder.module.css";

/**
 * "Custom Bike Builder" — a 15-step product configurator.
 *
 * Flow:
 *   1. Landing   – hero, price, optional AI prompt + the 15-part checklist,
 *                  then "Start building".
 *   2. Builder   – steps 1..15. For each step the customer picks one part and
 *                  answers that part's customization axes (size/colour, etc.).
 *   3. Review    – the full 15-part build with line total + grand total.
 *
 * On "Add to cart" every chosen part becomes its own cart line, so the whole
 * build appears alongside normal storefront items in the existing cart,
 * checkout and order pipeline (the selected axes are carried on the existing
 * size/color fields — no new cart machinery needed).
 *
 * All step + product data is passed in from the server component
 * (`getBikeBuilderSteps`), never hardcoded here.
 */

type View = "landing" | "builder" | "review";

/** A completed choice for one step. */
type Selection = {
  /** Chosen product for this step. */
  product: BuilderProduct;
  /** axis label → chosen option string. */
  axisValues: Record<string, string>;
};

const AI_SUGGESTIONS = [
  "Aggressive downhill, I ride in the rain, 5'10\"",
  "Weekend trails on a tight budget",
  "Racing cross-country, lightest possible",
];

export default function CustomBikeBuilder({
  steps,
  stepsError,
}: {
  steps: BuilderStep[];
  stepsError: string | null;
}) {
  const { addItem } = useCart();
  const [view, setView] = useState<View>("landing");
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState("");
  // stepNumber -> Selection
  const [selections, setSelections] = useState<Record<number, Selection>>({});
  const [added, setAdded] = useState(false);
  const [manual, setManual] = useState(false);

  const orderedSteps = useMemo(
    () => [...steps].sort((a, b) => a.stepNumber - b.stepNumber),
    [steps]
  );

  const startBuilding = () => {
    // Pre-select the first in-stock product + first axis option on every step
    // so the customer can jump straight in and refine as they go.
    const initial: Record<number, Selection> = {};
    for (const step of orderedSteps) {
      const firstInStock = step.products.find((p) => p.stock > 0);
      if (!firstInStock) continue;
      const values: Record<string, string> = {};
      for (const axis of step.axes) {
        if (axis.options.length > 0) values[axis.label] = axis.options[0];
      }
      initial[step.stepNumber] = {
        product: firstInStock,
        axisValues: values,
      };
    }
    setSelections(initial);
    setCurrentStep(0);
    setAdded(false);
    setView(orderedSteps.length > 0 ? "builder" : "review");
  };

  if (stepsError) {
    return (
      <main className={styles.page}>
        <div className={styles.message}>
          <h1 className={styles.title}>Custom Bike Builder</h1>
          <p className={styles.errorText}>{stepsError}</p>
        </div>
      </main>
    );
  }

  if (steps.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.message}>
          <h1 className={styles.title}>Custom Bike Builder</h1>
          <p className={styles.errorText}>
            The bike builder isn&apos;t set up yet. Please check back soon.
          </p>
        </div>
      </main>
    );
  }

  // ---- Landing -------------------------------------------------------------
  if (view === "landing") {
    return (
      <main className={styles.page}>
        <div className={styles.column}>
          <h1 className={styles.title}>Custom Bike Builder</h1>
          <p className={styles.lead}>
            A hand-built alloy trail platform tuned in our Tabaco City workshop.
            Pick your fit, finish and parts — we assemble, tune and ship it
            ride-ready.
          </p>

          <div className={styles.hero}>
            <Image
              src="/Customerpageimages/image1forbikecustomize.png"
              alt="Custom-built alloy trail bike"
              fill
              sizes="(max-width: 760px) 100vw, 720px"
              className={styles.heroImg}
              priority
            />
          </div>

          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Starts at</span>
            <span className={styles.priceValue}>
              {formatPeso(
                orderedSteps.reduce(
                  (sum, step) =>
                    sum + (step.products.find((p) => p.stock > 0)?.price ?? 0),
                  0
                )
              )}
            </span>
          </div>

          {/* AI builder (optional) */}
          <section className={styles.aiCard}>
            <div className={styles.aiHead}>
              <svg
                className={styles.aiIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z"
                  fill="currentColor"
                />
              </svg>
              <span className={styles.aiTitle}>Let AI build it for you</span>
              <span className={styles.optional}>Optional</span>
            </div>

            <p className={styles.aiDesc}>
              Describe how and where you ride — terrain, weather, budget, your
              height and we&apos;ll pick every part for you. You can change
              anything afterwards.
            </p>

            <div className={styles.textarea}>
              <textarea
                className={styles.textareaInput}
                placeholder="e.g. Rocky enduro trails, wet season, 175cm, mid budget"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                aria-label="Describe how and where you ride"
              />
            </div>

            <div className={styles.chips}>
              {AI_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={styles.chip}
                  onClick={() => setPrompt(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.buildBtn}
              onClick={() => {
                setManual(true);
                startBuilding();
              }}
            >
              <svg
                className={styles.buildIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z"
                  fill="currentColor"
                />
              </svg>
              Build it for me
            </button>
          </section>

          <h2 className={styles.partsHeading}>Choose the parts yourself</h2>
          <ul className={styles.partsList}>
            {orderedSteps.map((step) => (
              <li className={styles.partItem} key={step.stepNumber}>
                <span className={styles.partBadge} aria-hidden="true">
                  {step.stepNumber}
                </span>
                <div className={styles.partBody}>
                  <p className={styles.partTitle}>{step.name}</p>
                  <p className={styles.partDesc}>{step.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className={styles.note}>
            You can go back and change anything before checkout.
          </p>

          <button
            type="button"
            className={styles.startBuilding}
            onClick={() => {
              setManual(false);
              startBuilding();
            }}
          >
            Start building
            <svg
              className={styles.startArrow}
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4 12 H19 M13 6 L19 12 L13 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </main>
    );
  }


  // ---- Builder -------------------------------------------------------------
  if (view === "builder") {
    const step = orderedSteps[currentStep];
    const selection = selections[step.stepNumber];
    const isLast = currentStep === orderedSteps.length - 1;

    const chooseProduct = (product: BuilderProduct) => {
      setSelections((prev) => ({
        ...prev,
        [step.stepNumber]: {
          product,
          axisValues: prev[step.stepNumber]?.axisValues ?? {},
        },
      }));
    };

    const chooseAxis = (label: string, value: string) => {
      setSelections((prev) => ({
        ...prev,
        [step.stepNumber]: {
          product:
            prev[step.stepNumber]?.product ??
            step.products.find((p) => p.stock > 0) ??
            step.products[0],
          axisValues: {
            ...(prev[step.stepNumber]?.axisValues ?? {}),
            [label]: value,
          },
        },
      }));
    };

    const handleNext = () => {
      if (isLast) {
        setView("review");
      } else {
        setCurrentStep((i) => i + 1);
      }
    };

    return (
      <main className={styles.page}>
        <div className={styles.column}>
          {/* Progress */}
          <div className={styles.progressRow}>
            <span className={styles.progressLabel}>
              Step {currentStep + 1} of {orderedSteps.length}
            </span>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${((currentStep + 1) / orderedSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Step heading */}
          <h1 className={styles.stepTitle}>
            {step.stepNumber}. {step.name}
          </h1>
          <p className={styles.stepDesc}>{step.description}</p>
          {step.notice ? (
            <p className={styles.stepNotice}>{step.notice}</p>
          ) : null}

          {/* Product options */}
          <div className={styles.productGrid}>
            {step.products.map((product) => {
              const active =
                selection?.product.id === product.id ||
                (!selection && product === step.products[0]);
              const outOfStock = product.stock <= 0;
              const onSale =
                product.compareAtPrice !== null &&
                product.compareAtPrice > product.price;
              return (
                <button
                  key={product.id}
                  type="button"
                  className={
                    active ? styles.productCardActive : styles.productCard
                  }
                  onClick={() => chooseProduct(product)}
                  aria-pressed={active}
                  disabled={outOfStock}
                >
                  <div className={styles.productImage}>
                    <Image
                      src={product.image ?? PRODUCT_PLACEHOLDER_SRC}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 45vw, 220px"
                      className={styles.productImg}
                    />
                    {onSale ? (
                      <span className={styles.saleBadge}>Sale</span>
                    ) : null}
                  </div>
                  <div className={styles.productBody}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    {product.description ? (
                      <p className={styles.productDesc}>{product.description}</p>
                    ) : null}
                    <p className={styles.productPrice}>
                      {formatPeso(product.price)}
                      {onSale ? (
                        <span className={styles.compareAt}>
                          {formatPeso(product.compareAtPrice ?? 0)}
                        </span>
                      ) : null}
                    </p>
                    <p
                      className={
                        outOfStock ? styles.stockOut : styles.productStock
                      }
                    >
                      {outOfStock ? "Out of stock" : `${product.stock} in stock`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Axis selectors for the chosen product */}
          {step.axes.length > 0 ? (
            <div className={styles.optionsCard}>
              <h2 className={styles.optionsTitle}>Customize this part</h2>
              <div className={styles.axisGrid}>
                {step.axes.map((axis) => {
                  const current =
                    selection?.axisValues[axis.label] ?? axis.options[0];
                  return (
                    <label key={axis.label} className={styles.axisField}>
                      <span className={styles.axisLabel}>{axis.label}</span>
                      <select
                        className={styles.axisSelect}
                        value={current}
                        onChange={(event) =>
                          chooseAxis(axis.label, event.target.value)
                        }
                      >
                        {axis.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Nav */}
          <div className={styles.stepNav}>
            <button
              type="button"
              className={styles.backBtn}
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((i) => i - 1)}
            >
              Back
            </button>
            <button
              type="button"
              className={styles.nextBtn}
              onClick={handleNext}
            >
              {isLast ? "Review build" : "Next"}
              <svg
                className={styles.nextArrow}
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M4 12 H19 M13 6 L19 12 L13 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>
    );
  }


  // ---- Review --------------------------------------------------------------
  const total = orderedSteps.reduce((sum, step) => {
    const s = selections[step.stepNumber];
    return sum + (s ? s.product.price : 0);
  }, 0);

  const orderedSelections = orderedSteps
    .map((step) => ({
      step,
      selection: selections[step.stepNumber],
    }))
    .filter((entry) => entry.selection);

  const handleAddToCart = () => {
    for (const entry of orderedSelections) {
      const { step, selection } = entry;
      const axisEntries = Object.entries(selection!.axisValues);
      // The selected options travel on the existing size/color cart fields so
      // they display in the cart and persist onto the order line.
      const sizeText = axisEntries
        .map(([label, value]) => `${label}: ${value}`)
        .join(" · ");
      const colorText =
        axisEntries.find(([label]) => /colour|color|finish/i.test(label))?.[1] ??
        axisEntries[0]?.[1] ??
        "Custom";

      addItem({
        productId: selection!.product.id,
        name: `${step.name} — ${selection!.product.name}`,
        price: selection!.product.price,
        image: selection!.product.image ?? PRODUCT_PLACEHOLDER_SRC,
        size: sizeText || "Standard",
        color: colorText,
        quantity: 1,
        // Carry the real stock so the cart/order line reflects the product's
        // actual availability from the Admin catalog (0 means "no cap" for
        // legacy behavior, but the real value is used when available).
        stock: selection!.product.stock,
      });
    }
    setAdded(true);
  };

  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.title}>Your custom build</h1>
        <p className={styles.lead}>
          Review every part below. You can go back to any step to make changes
          before adding your build to the cart.
        </p>

        <button
          type="button"
          className={styles.editBtn}
          onClick={() => {
            setCurrentStep(0);
            setView("builder");
          }}
        >
          Edit parts
        </button>

        <ul className={styles.reviewList}>
          {orderedSelections.map(({ step, selection }) => {
            const axisText = Object.entries(selection!.axisValues)
              .map(([label, value]) => `${label}: ${value}`)
              .join(" · ");
            return (
              <li className={styles.reviewItem} key={step.stepNumber}>
                <span className={styles.reviewBadge} aria-hidden="true">
                  {step.stepNumber}
                </span>
                <div className={styles.reviewBody}>
                  <p className={styles.reviewName}>
                    {step.name}
                    <span className={styles.reviewProduct}>
                      {selection!.product.name}
                    </span>
                  </p>
                  {axisText ? (
                    <p className={styles.reviewAxes}>{axisText}</p>
                  ) : null}
                </div>
                <p className={styles.reviewPrice}>
                  {formatPeso(selection!.product.price)}
                </p>
              </li>
            );
          })}
        </ul>

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Build total</span>
          <span className={styles.totalValue}>{formatPeso(total)}</span>
        </div>

        <p className={styles.note}>
          {manual
            ? "Your parts below were chosen by the AI builder as a starting point — review or edit anything before adding to cart."
            : "Shipping is calculated at checkout. You can change any part below before adding to cart."}
        </p>

        <div className={styles.reviewActions}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => {
              setCurrentStep(orderedSteps.length - 1);
              setView("builder");
            }}
          >
            Back
          </button>
          <button
            type="button"
            className={styles.addToCart}
            onClick={handleAddToCart}
            disabled={added}
          >
            {added ? (
              "Added to Cart ✓"
            ) : (
              <>
                <svg
                  className={styles.cartIcon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M6 6h15l-1.5 9H7.5L6 6zm1 0 1-3h4M9 20a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 9 20zm8 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

