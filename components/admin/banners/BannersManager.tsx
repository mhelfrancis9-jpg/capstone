"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useShop } from "@/components/customer/ShopContext";
import { ImagePlusIcon, Trash2Icon } from "@/components/admin/icons";
import styles from "./BannersManager.module.css";

/**
 * Admin manager for the homepage banner images. Uploaded files are read as
 * data URLs and pushed through the existing useShop() addBanners/removeBanner
 * API — no parallel state mechanism is introduced.
 */
export default function BannersManager() {
  const { banners, addBanners, removeBanner } = useShop();
  const fileRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setReading(true);

    const readers: Promise<string>[] = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers)
      .then((urls) => {
        addBanners(urls.filter(Boolean));
      })
      .catch({
        // Non-fatal: failed reads simply don't add anything.
      } as unknown as () => void)
      .finally(() => {
        setReading(false);
        if (fileRef.current) fileRef.current.value = "";
      });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Homepage banner images</h1>
          <p className={styles.description}>
            These rotate behind the headline on the storefront homepage. Upload
            from this computer.
          </p>
        </div>
        <button
          type="button"
          className={styles.uploadButton}
          onClick={() => fileRef.current?.click()}
          disabled={reading}
        >
          <ImagePlusIcon size={16} />
          {reading ? "Reading…" : "Upload images"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className={styles.hiddenFile}
          onChange={handleUpload}
        />
      </div>

      <div className={styles.card}>
        {banners.length === 0 ? (
          <div className={styles.empty}>
            No banner images yet. The homepage hero will show a plain dark
            background until you upload one.
          </div>
        ) : (
          <div className={styles.grid}>
            {banners.map((url, index) => (
              <div key={url} className={styles.tile}>
                <div className={styles.imageWrap}>
                  <div className={styles.imageInner}>
                    <Image
                      src={url}
                      alt={`Banner ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className={styles.tileImage}
                    />
                  </div>
                  <span className={styles.badge}>
                    {index === 0 ? "Shown first" : `Slot ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => removeBanner(url)}
                    aria-label={`Remove banner ${index + 1}`}
                  >
                    <Trash2Icon size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
