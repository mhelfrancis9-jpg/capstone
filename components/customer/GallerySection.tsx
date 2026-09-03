import Image from "next/image";
import Link from "next/link";
import { GALLERY_IMAGES } from "./data";
import styles from "./GallerySection.module.css";

/**
 * "Explore Customer Gallery" — asymmetric masonry grid. Left and center
 * columns hold two stacked tiles; the right column is one tall image
 * spanning the height of the two smaller ones.
 */
export default function GallerySection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Explore Customer Gallery</h2>

        <div className={styles.grid}>
          {GALLERY_IMAGES.map((image, index) => (
            <div
              key={image.src}
              className={index === GALLERY_IMAGES.length - 1 ? styles.tall : styles.tile}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 33vw, 380px"
                className={styles.image}
              />
            </div>
          ))}
        </div>

        <div className={styles.viewAllWrap}>
          <Link href="/gallery" className={styles.viewAll}>
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
