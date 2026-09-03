"use client";

import { useState } from "react";
import type {
  CategoryRow,
  ProductRow,
  ProductStatus,
} from "@/lib/data/types";
import type { CategoryAxis } from "./categoryConfig";
import { getCategoryAxes } from "./categoryConfig";
import { CategoryPicker } from "./CategoryPicker";
import { OptionGroup } from "./OptionGroup";
import styles from "./ProductFormModal.module.css";

interface ProductFormModalProps {
  product: ProductRow | null;
  categories: CategoryRow[];
  onClose: () => void;
  onSave: (payload: ProductFormPayload) => Promise<{ error: string | null }>;
  submitting: boolean;
  onThumbnailUpload?: (file: File) => Promise<string | null>;
  onGalleryUpload?: (files: File[]) => Promise<string[]>;
}

export interface ProductFormPayload {
  name: string;
  slug: string;
  categoryId: string;
  sku: string;
  description: string;
  tagline: string;
  specs: string;
  price: string;
  compareAtPrice: string;
  cost: string;
  stock: string;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  thumbnail: string;
  images: string[];
  variants: VariantForm[];
  available: boolean;
  customizationValues: Record<string, string[]>;
}

type VariantForm = {
  key: string;
  size: string;
  color: string;
  sku: string;
  price: string;
  stock: string;
  available: boolean;
};

const EMPTY_FORM: Omit<ProductFormPayload, "available" | "customizationValues"> = {
  name: "",
  slug: "",
  categoryId: "",
  sku: "",
  description: "",
  tagline: "",
  specs: "",
  price: "0",
  compareAtPrice: "",
  cost: "",
  stock: "0",
  status: "active",
  isFeatured: false,
  isNewArrival: false,
  thumbnail: "",
  images: [],
  variants: [],
};

/**
 * Builds the initial modal state from an existing product row (edit mode):
 * pre-filled fields, the availability toggle and the customization picks.
 * This is the exact inverse of the payload assembled in
 * ProductsManager.buildPayload(), so reopening a product shows everything
 * that was saved and re-saving it does not duplicate or drop data.
 */
function formStateFromProduct(
  product: ProductRow,
  categories: CategoryRow[]
): {
  form: typeof EMPTY_FORM;
  available: boolean;
  customizationValues: Record<string, string[]>;
} {
  const images = [...(product.product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  // Customization picks are stored inside `specs` as "flag: value1, value2"
  // lines (see ProductsManager.buildPayload). Pull those lines back into the
  // Customization Fields state and remove them from the textarea so saving an
  // unchanged edit doesn't duplicate them.
  const axes = getCategoryAxes(
    product.category?.slug ??
      categories.find((category) => category.id === product.category_id)?.slug ??
      null
  );
  const customizationValues: Record<string, string[]> = {};
  const specs = (product.specs ?? []).filter((line) => {
    const colon = line.indexOf(":");
    if (colon === -1) return true;
    const flag = line.slice(0, colon).trim();
    const axis = axes.find((a) => a.flag === flag);
    if (!axis) return true;
    customizationValues[flag] = line
      .slice(colon + 1)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    return false;
  });

  return {
    form: {
      ...EMPTY_FORM,
      name: product.name,
      slug: product.slug,
      categoryId: product.category_id ?? "",
      sku: product.sku ?? "",
      description: product.description ?? "",
      tagline: (product.tagline ?? []).join("\n"),
      specs: specs.join("\n"),
      price: String(product.price),
      compareAtPrice:
        product.compare_at_price != null ? String(product.compare_at_price) : "",
      cost: product.cost != null ? String(product.cost) : "",
      stock: String(product.stock),
      status: product.status,
      isFeatured: product.is_featured,
      isNewArrival: product.is_new_arrival,
      thumbnail: images[0]?.url ?? "",
      images: images.slice(1).map((image) => image.url),
      variants: (product.product_variants ?? []).map((variant) => ({
        key: variant.id ?? crypto.randomUUID(),
        size: variant.size ?? "",
        color: variant.color ?? "",
        sku: variant.sku ?? "",
        price: String(variant.price),
        stock: String(variant.stock),
        available: variant.available,
      })),
    },
    available: product.status === "active",
    customizationValues,
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export default function ProductFormModal({
  product,
  categories,
  onClose,
  onSave,
  submitting,
  onThumbnailUpload,
  onGalleryUpload,
}: ProductFormModalProps) {
  const initialEditState = product ? formStateFromProduct(product, categories) : null;

  const [form, setForm] = useState<typeof EMPTY_FORM>(
    initialEditState?.form ?? { ...EMPTY_FORM }
  );
  const [available, setAvailable] = useState(
    initialEditState?.available ?? true
  );
  const [customizationValues, setCustomizationValues] = useState<
    Record<string, string[]>
  >(initialEditState?.customizationValues ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [galleryDraft, setGalleryDraft] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const slugEdited = useState(product !== null);
  const isEdit = product !== null;

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const setVariant = (key: string, patch: Partial<VariantForm>) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.key === key ? { ...variant, ...patch } : variant
      ),
    }));
  };

  const addVariant = () => {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        { key: crypto.randomUUID(), size: "", color: "", sku: "", price: "0", stock: "0", available: true },
      ],
    }));
  };

  const removeVariant = (key: string) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((variant) => variant.key !== key),
    }));
  };

  const addGalleryImage = () => {
    const value = galleryDraft.trim();
    if (!value) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, value] }));
    setGalleryDraft("");
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const axes = getCategoryAxes(form.categoryId);

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) {
      next.name = "Give the product a name.";
    }
    if (Number(form.price) <= 0) {
      next.price = "Set a price above ₱0.";
    }
    if (Number(form.stock) < 0) {
      next.stock = "Stock cannot be negative.";
    }
    Object.entries(customizationValues).forEach(([key, values]) => {
      if (values.length === 0) {
        next[key] = `Add at least one option to ${key}.`;
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: ProductFormPayload = {
      ...form,
      available,
      customizationValues,
    };
    const result = await onSave(payload);
    if (result.error) {
      setFormError(result.error);
    }
  };

  return (
    <div className={styles.overlay} onMouseDown={(e) => {
      if (e.target === e.currentTarget && !submitting) onClose();
    }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="product-form-title">
        <div className={styles.header}>
          <div>
            <h2 id="product-form-title" className={styles.title}>
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <p className={styles.subtitle}>
              {isEdit
                ? "Update the product information below."
                : "Add a new product to your store."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className={styles.closeButton}
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
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
        </div>

        <div className={styles.body}>
          {/* Product Information */}
          <div>
            <h3 className={styles.sectionTitle}>Product Information</h3>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-name">Product Name</label>
                <input
                  id="product-name"
                  type="text"
                  className={styles.input}
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    updateField("name", name);
                    if (!slugEdited[0]) {
                      updateField("slug", slugify(name));
                    }
                  }}
                  placeholder="Product name"
                  required
                />
                {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-brand">Brand</label>
                <input
                  id="product-brand"
                  type="text"
                  className={styles.input}
                  value={form.sku}
                  onChange={(e) => updateField("sku", e.target.value)}
                  placeholder="Brand or SKU"
                />
              </div>

              <div className={styles.fieldFull}>
                <label className={styles.label} htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  className={styles.textarea}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Product description"
                  rows={3}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-price">Price (₱)</label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={styles.input}
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                />
                {errors.price && <p className={styles.fieldError}>{errors.price}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-stock">Stock</label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  className={styles.input}
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                />
                {errors.stock && <p className={styles.fieldError}>{errors.stock}</p>}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <CategoryPicker
              value={form.categoryId}
              onChange={(value) => updateField("categoryId", value)}
              categories={categories}
              error={errors.categoryId}
            />
          </div>

          {/* Availability */}
          <div>
            <h3 className={styles.sectionTitle}>Availability</h3>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkLabel}>Available for purchase</span>
            </label>
            <div className={styles.checkRow}>
              <input
                id="product-featured"
                type="checkbox"
                className={styles.checkbox}
                checked={form.isFeatured}
                onChange={(e) => updateField("isFeatured", e.target.checked)}
              />
              <label className={styles.checkLabel} htmlFor="product-featured">
                Featured product
              </label>
            </div>
            <div className={styles.checkRow}>
              <input
                id="product-new-arrival"
                type="checkbox"
                className={styles.checkbox}
                checked={form.isNewArrival}
                onChange={(e) => updateField("isNewArrival", e.target.checked)}
              />
              <label className={styles.checkLabel} htmlFor="product-new-arrival">
                New arrival (shown in the storefront “New Arrivals” section)
              </label>
            </div>
          </div>

          {/* Customization Fields */}
          {axes.length > 0 && (
            <div>
              <h3 className={styles.sectionTitle}>Customization Fields</h3>
              <div className={styles.spaceY3}>
                {axes.map((axis: CategoryAxis) => (
                  <OptionGroup
                    key={axis.flag}
                    label={axis.label}
                    hint={axis.hint}
                    enabled={
                      (customizationValues[axis.flag]?.length ?? 0) > 0 ||
                      Object.keys(customizationValues).length === 0
                    }
                    onToggle={(enabled) => {
                      setCustomizationValues((prev) => {
                        if (!enabled) {
                          const next = { ...prev };
                          delete next[axis.flag];
                          return next;
                        }
                        return prev;
                      });
                    }}
                    values={customizationValues[axis.flag] ?? []}
                    onChange={(values) =>
                      setCustomizationValues((prev) => ({
                        ...prev,
                        [axis.flag]: values,
                      }))
                    }
                    presets={axis.presets}
                    placeholder={axis.placeholder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          <div>
            <h3 className={styles.sectionTitle}>Images</h3>
            <div className={styles.spaceY4}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-thumbnail">Thumbnail</label>
                <div className={styles.uploadControl}>
                  <input
                    id="product-thumbnail"
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (onThumbnailUpload) {
                        onThumbnailUpload(file).then((url) => {
                          if (url) updateField("thumbnail", url);
                        });
                      }
                      e.target.value = "";
                    }}
                    disabled={submitting}
                  />
                  <label htmlFor="product-thumbnail" className={styles.uploadLabel}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <path d="m17 8-5-5-5 5" />
                      <path d="M12 3v12" />
                    </svg>
                    {form.thumbnail ? "Replace thumbnail" : "Upload thumbnail"}
                  </label>
                </div>
                {form.thumbnail && (
                  <div className={styles.thumbnailPreview}>
                    <img src={form.thumbnail} alt="Thumbnail preview" className={styles.previewImage} />
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-gallery-url">Additional Images</label>
                <div className={styles.uploadControl}>
                  <input
                    id="product-gallery-url"
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles.fileInput}
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length === 0) return;
                      if (onGalleryUpload) {
                        onGalleryUpload(files).then((urls) => {
                          if (urls.length > 0) {
                            setForm((prev) => ({
                              ...prev,
                              images: [...prev.images, ...urls],
                            }));
                          }
                        });
                      }
                      e.target.value = "";
                    }}
                    disabled={submitting}
                  />
                  <label htmlFor="product-gallery-url" className={styles.uploadLabel}>
                    <svg
                      width="16"
                      height="16"
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
                    Add gallery images
                  </label>
                </div>

                <div className={styles.galleryUrlRow}>
                  <input
                    value={galleryDraft}
                    onChange={(e) => setGalleryDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addGalleryImage();
                      }
                    }}
                    placeholder="Paste an image URL and press Add"
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={addGalleryImage}
                    className={styles.addButton}
                  >
                    Add
                  </button>
                </div>

                {form.images.length > 0 && (
                  <div className={styles.galleryGrid}>
                    {form.images.map((url, index) => (
                      <div key={`${url}-${index}`} className={styles.galleryItem}>
                        <img src={url} alt={`Gallery ${index + 1}`} className={styles.galleryImage} />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          aria-label={`Remove image ${index + 1}`}
                          className={styles.galleryRemove}
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
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className={styles.sectionTitle}>Pricing</h3>
            <div className={styles.grid3}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-price-2">Price (₱)</label>
                <input
                  id="product-price-2"
                  type="number"
                  min="0"
                  step="0.01"
                  className={styles.input}
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                />
                {errors.price && <p className={styles.fieldError}>{errors.price}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-compare-price">Compare-at Price (₱)</label>
                <input
                  id="product-compare-price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={styles.input}
                  value={form.compareAtPrice}
                  onChange={(e) => updateField("compareAtPrice", e.target.value)}
                  placeholder="Optional sale reference"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-cost">Cost (₱)</label>
                <input
                  id="product-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  className={styles.input}
                  value={form.cost}
                  onChange={(e) => updateField("cost", e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div>
            <h3 className={styles.sectionTitle}>Inventory</h3>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="product-stock-2">Base Stock</label>
              <input
                id="product-stock-2"
                type="number"
                min="0"
                step="1"
                className={styles.input}
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
              />
              <span className={styles.formHint}>
                When variants exist, the total stock is the sum of all variant stock.
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className={styles.sectionTitle}>Description</h3>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="product-tagline">Taglines (one per line)</label>
              <textarea
                id="product-tagline"
                className={styles.textarea}
                value={form.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder={"e.g.\nTrail-ready geometry\nFlat pedal friendly"}
                rows={3}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="product-description-2">Description</label>
              <textarea
                id="product-description-2"
                className={styles.textarea}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="A short summary shown under the product name."
                rows={3}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="product-specs">Specifications (one per line)</label>
              <textarea
                id="product-specs"
                className={styles.textarea}
                value={form.specs}
                onChange={(e) => updateField("specs", e.target.value)}
                placeholder={'e.g.\nFrame: MET BLUEGRASS\nWheels: 29"'}
                rows={4}
              />
            </div>
          </div>

          {/* Variants */}
          <div>
            <h3 className={styles.sectionTitle}>Variants</h3>
            <p className={styles.inlineNote}>
              Optional size/color combinations. When at least one variant is listed, the product&apos;s stock and price are driven by the variants.
            </p>
            {form.variants.map((variant, index) => (
              <div key={variant.key} className={styles.variantRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`variant-size-${variant.key}`}>Size</label>
                  <input
                    id={`variant-size-${variant.key}`}
                    type="text"
                    className={styles.input}
                    value={variant.size}
                    onChange={(e) => setVariant(variant.key, { size: e.target.value })}
                    placeholder="e.g. 27.5, 29, Medium"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`variant-color-${variant.key}`}>Color</label>
                  <input
                    id={`variant-color-${variant.key}`}
                    type="text"
                    className={styles.input}
                    value={variant.color}
                    onChange={(e) => setVariant(variant.key, { color: e.target.value })}
                    placeholder="e.g. Matte Black"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`variant-sku-${variant.key}`}>SKU</label>
                  <input
                    id={`variant-sku-${variant.key}`}
                    type="text"
                    className={styles.input}
                    value={variant.sku}
                    onChange={(e) => setVariant(variant.key, { sku: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`variant-price-${variant.key}`}>Price (₱)</label>
                  <input
                    id={`variant-price-${variant.key}`}
                    type="number"
                    min="0"
                    step="0.01"
                    className={styles.input}
                    value={variant.price}
                    onChange={(e) => setVariant(variant.key, { price: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`variant-stock-${variant.key}`}>Stock</label>
                  <input
                    id={`variant-stock-${variant.key}`}
                    type="number"
                    min="0"
                    step="1"
                    className={styles.input}
                    value={variant.stock}
                    onChange={(e) => setVariant(variant.key, { stock: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.checkboxVariant}>
                    <input
                      type="checkbox"
                      checked={variant.available}
                      onChange={(e) => setVariant(variant.key, { available: e.target.checked })}
                    />
                    Available
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(variant.key)}
                  aria-label={`Remove variant ${index + 1}`}
                  className={styles.removeButton}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariant}
              className={styles.secondaryButton}
            >
              <svg
                width="16"
                height="16"
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
              Add variant
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          {formError && (
            <p role="alert" className={styles.formError}>
              {formError}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className={styles.secondaryButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={styles.primaryButton}
          >
            {submitting
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}
