import Link from "next/link";
import styles from "./About.module.css";

/**
 * About Us page content — rendered between the existing customer header and
 * footer on /about. Follows the reference design: dark hero, three service
 * cards, a "Visit the shop" card and a yellow CTA.
 */
export default function About() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.label}>About Us</p>
          <h1 className={styles.title}>
            A Tabaco City workshop that rides what it sells.
          </h1>
          <p className={styles.description}>
            LnR Cycle Center has been building, fixing and racing bikes in
            Albay since 2011. We stock the parts our own riders trust, run
            community events every month, and stand behind every build with a
            free first service.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className={styles.content}>
        <div className={styles.servicesGrid}>
          {/* Service 1 */}
          <article className={styles.serviceCard}>
            <svg
              className={styles.serviceIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />
            </svg>
            <h2 className={styles.serviceTitle}>Custom builds</h2>
            <p className={styles.serviceDescription}>
              We spec, lace, torque and tune complete bikes in house — every
              build gets a fitting before it leaves.
            </p>
          </article>

          {/* Service 2 */}
          <article className={styles.serviceCard}>
            <svg
              className={styles.serviceIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />
            </svg>
            <h2 className={styles.serviceTitle}>Service and repair</h2>
            <p className={styles.serviceDescription}>
              Bleeds, tubeless setups, drivetrain overhauls and suspension
              servicing, usually turned around same week.
            </p>
          </article>

          {/* Service 3 */}
          <article className={styles.serviceCard}>
            <svg
              className={styles.serviceIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />
            </svg>
            <h2 className={styles.serviceTitle}>Race support</h2>
            <p className={styles.serviceDescription}>
              Our mechanics run the neutral service convoy at every LnR event
              on the calendar.
            </p>
          </article>
        </div>

        {/* Shop + CTA */}
        <div className={styles.bottomGrid}>
          <div className={styles.shopCard}>
            <h2 className={styles.shopTitle}>Visit the shop</h2>
            <ul className={styles.shopList}>
              <li className={styles.shopItem}>
                <svg
                  className={styles.shopIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>
                  Ziga Avenue, Barangay Basud,
                  Tabaco City, Albay
                </span>
              </li>

              <li className={styles.shopItem}>
                <svg
                  className={styles.shopIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>
                  (052) 830 4409 · lnrcyclecenter@gmail.com
                </span>
              </li>

              <li className={styles.shopItem}>
                <svg
                  className={styles.shopIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className={styles.hours}>
                  <span className={styles.hoursRow}>
                    <span className={styles.hoursDay}>
                      Monday – Friday
                    </span>
                    — 9:00 AM – 7:00 PM
                  </span>
                  <span className={styles.hoursRow}>
                    <span className={styles.hoursDay}>Saturday</span>
                    — 8:00 AM – 6:00 PM
                  </span>
                  <span className={styles.hoursRow}>
                    <span className={styles.hoursDay}>Sunday</span>
                    — 8:00 AM – 12:00 NN
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Planning a build?</h2>
            <p className={styles.ctaDescription}>
              Tell us how and where you ride and our fitters will spec every
              part before you pay a peso.
            </p>
            <Link href="/custom-bike-builder" className={styles.ctaButton}>
              Start a custom build
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

