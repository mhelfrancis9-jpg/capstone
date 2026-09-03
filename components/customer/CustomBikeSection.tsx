import Image from "next/image";
import Link from "next/link";
import styles from "./CustomBikeSection.module.css";

/**
 * "Custom is our specialty" promo block — pixel-faithful rebuild of the Figma
 * frame (522:1454). Dark gradient panel on the left with an eyebrow label,
 * "BUILD YOUR OWN CUSTOM BIKE" headline, supporting copy and a "Start Now"
 * button, paired with a rounded image tile (existing asset) on the right and
 * two soft blurred colour blobs.
 *
 * Self-contained: it does not touch the surrounding storefront sections and
 * adapts to laptop/tablet widths. The "Start Now" button navigates to the
 * /custom-bike-builder page where the full builder is implemented.
 */
export default function CustomBikeSection() {
  return (
    <section id="bike-customize" className={styles.section} aria-labelledby="custom-bike-heading">
      <div className={styles.background}>
        {/* 5% red overlay layer (Figma #D14444 @ 0.05) */}
        <div className={styles.redOverlay} aria-hidden="true" />

        <div className={styles.container}>
          <div className={styles.content}>
            <p className={styles.eyebrow}>Custom is our specialty</p>

            <h2 id="custom-bike-heading" className={styles.heading}>
              <span className={styles.headingLine}>BUILD</span>
              <span className={styles.headingLine}>YOUR OWN</span>
              <span className={styles.headingLine}>CUSTOM BIKE</span>
            </h2>

            <p className={styles.body}>
              Our AI-Powered bike builder lets you customize every component of
              your ride, so your next bike fits your style better than any
              off-the-shelf build. Each one is hand-assembled by our expert
              mechanics and shipped straight to your door.
            </p>

            <div className={styles.buttonWrap}>
              <Link href="/custom-bike-builder" className={styles.button}>
                Start Now
              </Link>
            </div>
          </div>

          <div className={styles.media}>
            <div className={styles.mediaInner}>
              {/* Existing project asset — do not replace or add a placeholder. */}
              <Image
                src="/Customerpageimages/image1forbikecustomize.png"
                alt="Custom-built bike preview"
                fill
                sizes="(max-width: 980px) 100vw, 584px"
                className={styles.image}
              />
              {/* Dark gradient overlay (Figma linear #000 0.4 -> 0) */}
              <div className={styles.imageOverlay} aria-hidden="true" />
            </div>

            {/* Soft blurred accent blobs (decorative) */}
            <div className={styles.blobYellow} aria-hidden="true" />
            <div className={styles.blobBlue} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
