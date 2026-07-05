import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { Zap, Cpu, Network, ArrowRight, Check, X, Wrench } from 'lucide-react';
import styles from './page.module.css';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/console');
  }

  const t = await getTranslations('landing');
  const tPlans = await getTranslations('plans');
  const tAuth = await getTranslations('auth');
  const tNav = await getTranslations('nav');

  return (
    <div className={styles.landing}>
      {/* ── HEADER ────────────────────────────── */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Zap size={16} strokeWidth={2.5} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>modclient</span>
            <span className={styles.logoDot}>.com</span>
          </div>
        </Link>
        <nav className={styles.nav}>
          <a href="#features" className={styles.navLink}>{tNav('registers')}</a>
          <a href="#features" className={styles.navLink}>{tNav('macros')}</a>
          <a href="#scan" className={styles.navLink}>{tNav('scan')}</a>
          <a href="#pricing" className={styles.navLink}>{t('pricing.title')}</a>
        </nav>
        <div className={styles.headerActions}>
          <LanguageSwitcher />
          <Link href="/login" className="btn-ghost btn-sm">
            {tAuth('login')}
          </Link>
          <Link href="/signup" className="btn-primary btn-sm">
            {tAuth('signup')}
          </Link>
        </div>
      </header>

      <main>
        {/* ── HERO SECTION ──────────────────────── */}
        <section className={styles.hero} id="hero">
          <div className={styles.badge}>
            <span className={styles.badgeLed} />
            {t('hero.systemVersion')}
          </div>
          <h1 className={styles.title}>
            {t('hero.title').split('Modbus RTU')[0]}
            <span className={styles.accentText}>Modbus RTU</span>
            {t('hero.title').split('Modbus RTU')[1] || ''}
          </h1>
          <p className={styles.subtitle}>
            {t('hero.subtitle')}
          </p>
          <div className={styles.ctas}>
            <Link href="/signup" className="btn-primary btn-lg">
              {t('hero.ctaStart')} <ArrowRight size={16} style={{ marginLeft: 4 }} />
            </Link>
            <Link href="/login" className="btn-ghost btn-lg">
              {t('hero.ctaDocs')}
            </Link>
          </div>

          {/* Live Status Bar */}
          <div className={styles.statusBar}>
            <div className={styles.statusItem}>
              <div className={styles.statusLabel}>{t('hero.status')}</div>
              <div className={`${styles.statusValue} ${styles.statusSuccess}`}>{t('hero.statusConnected')}</div>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusLabel}>{t('hero.latency')}</div>
              <div className={styles.statusValue}>{t('hero.latencyAvg')}</div>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusLabel}>{t('hero.throughput')}</div>
              <div className={styles.statusValue}>{t('hero.throughputVal')}</div>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusLabel}>{t('hero.errorRate')}</div>
              <div className={`${styles.statusValue} ${styles.statusError}`}>0.002%</div>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID AUDIENCE ───────────────── */}
        <section className={styles.audienceSection} id="audience">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('audience.title')}</h2>
            <p className={styles.sectionDesc}>{t('audience.desc')}</p>
          </div>
          <div className={styles.bentoGrid}>
            {/* Card 1 */}
            <div className={`${styles.bentoCard} ${styles.bentoCardPrimary}`}>
              <div className={`${styles.cardIcon} ${styles.iconPrimary}`}>
                <Wrench size={24} />
              </div>
              <h3 className={styles.cardTitle}>{t('audience.fieldEngTitle')}</h3>
              <p className={styles.cardText}>{t('audience.fieldEngDesc')}</p>
              <Link href="/signup" className={`${styles.cardCta} ${styles.cardCtaPrimary}`}>
                {t('audience.fieldEngCta')} <ArrowRight size={14} />
              </Link>
            </div>
            {/* Card 2 */}
            <div className={`${styles.bentoCard} ${styles.bentoCardSecondary}`}>
              <div className={`${styles.cardIcon} ${styles.iconSecondary}`}>
                <Zap size={24} />
              </div>
              <h3 className={styles.cardTitle}>{t('audience.plcDevTitle')}</h3>
              <p className={styles.cardText}>{t('audience.plcDevDesc')}</p>
              <Link href="/signup" className={`${styles.cardCta} ${styles.cardCtaSecondary}`}>
                {t('audience.plcDevCta')} <ArrowRight size={14} />
              </Link>
            </div>
            {/* Card 3 */}
            <div className={`${styles.bentoCard} ${styles.bentoCardTertiary}`}>
              <div className={`${styles.cardIcon} ${styles.iconTertiary}`}>
                <Network size={24} />
              </div>
              <h3 className={styles.cardTitle}>{t('audience.sysIntTitle')}</h3>
              <p className={styles.cardText}>{t('audience.sysIntDesc')}</p>
              <Link href="/signup" className={`${styles.cardCta} ${styles.cardCtaTertiary}`}>
                {t('audience.sysIntCta')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── SHOWCASE SECTION ─────────────────── */}
        <section className={styles.showcaseSection} id="features">
          <div className={styles.showcaseWrapper}>
            {/* Row 1: Registers Mapping */}
            <div className={styles.showcaseRow}>
              <div className={styles.showcaseContent}>
                <h2 className={styles.showcaseTitle}>{t('features.registersTitle')}</h2>
                <p className={styles.showcaseText}>{t('features.registersDesc')}</p>
                <ul className={styles.featureList}>
                  <li className={styles.featureItem}>
                    <Check size={16} className={styles.featureIcon} /> {t('features.registersItem1')}
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={16} className={styles.featureIcon} /> {t('features.registersItem2')}
                  </li>
                  <li className={styles.featureItem}>
                    <Check size={16} className={styles.featureIcon} /> {t('features.registersItem3')}
                  </li>
                </ul>
              </div>
              <div className={styles.showcaseVisual}>
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvuHMQU5qKbs2BfScFDM1EXLjdARwGYTcrekTd64V60hpV20bOgSDIhG-a1mypo_p01wlfsfzodRg0_Yx0j1X-t2-XfgSYeLqvNGN2GQi4hCC_aQZvQlcUuGv9wQyQZCMFBEiXQ1nX4uhhhRuofZrgfJcXGs-lp_yu05nVWbeuf0J041amYJB6OO7QaAsAAycdDzX96MwABy-39ygiaHB0e21bHzHcuOT026Wo3ZAOT2WcH1GNDpl1GFpESIuLelZ0rnV1rKXlBDQ"
                    alt="Register Mapping Visual"
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Autonomous Scan Sequences */}
            <div className={styles.showcaseRow} id="scan">
              <div className={styles.showcaseVisual}>
                <div className={styles.codePanel}>
                  <div className={styles.codeInit}>&gt; INIT_SCAN(COM3, 9600)</div>
                  <div className={styles.codeResult}>FOUND: SLAVE_01, SLAVE_14, SLAVE_42</div>
                  <div className={styles.codeMeta}>NETWORK HEALTH: 99.8%</div>
                </div>
              </div>
              <div className={styles.showcaseContent}>
                <h2 className={styles.showcaseTitle}>{t('features.scanTitle')}</h2>
                <p className={styles.showcaseText}>{t('features.scanDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING SECTION ──────────────────── */}
        <section className={styles.pricingSection} id="pricing">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('pricing.title')}</h2>
            <p className={styles.sectionDesc}>{t('pricing.desc')}</p>
          </div>
          <div className={styles.pricingGrid}>
            {/* Free Plan */}
            <div className={styles.priceCard}>
              <div className={styles.priceHeader}>
                <h3 className={styles.pricePlanName}>{t('pricing.freeName')}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.priceAmount}>{t('pricing.freePrice')}</span>
                  <span className={styles.pricePeriod}>{t('pricing.freePeriod')}</span>
                </div>
              </div>
              <ul className={styles.priceFeatures}>
                {tPlans.raw('freeFeatures').map((feature: string, index: number) => (
                  <li key={index} className={styles.priceFeatureItem}>
                    <Check size={16} className={styles.priceFeatureIcon} /> {feature}
                  </li>
                ))}
                {/* Visual indicator of features not present in Free but present in Pro */}
                <li className={`${styles.priceFeatureItem} ${styles.priceFeatureItemMuted}`}>
                  <X size={16} className={styles.priceFeatureIconMuted} /> {tPlans.raw('proFeatures')[4]}
                </li>
                <li className={`${styles.priceFeatureItem} ${styles.priceFeatureItemMuted}`}>
                  <X size={16} className={styles.priceFeatureIconMuted} /> {tPlans.raw('proFeatures')[5]}
                </li>
                <li className={`${styles.priceFeatureItem} ${styles.priceFeatureItemMuted}`}>
                  <X size={16} className={styles.priceFeatureIconMuted} /> {tPlans.raw('proFeatures')[6]}
                </li>
              </ul>
              <Link href="/signup" className="btn-ghost btn-full btn-lg" style={{ marginTop: 'auto' }}>
                {t('pricing.freeCta')}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className={`${styles.priceCard} ${styles.priceCardPro}`}>
              <div className={styles.recommendedBadge}>{t('pricing.recommended')}</div>
              <div className={styles.priceHeader}>
                <h3 className={styles.pricePlanName}>{t('pricing.proName')}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.priceAmount}>{t('pricing.proPrice')}</span>
                  <span className={styles.pricePeriod}>{t('pricing.proPeriod')}</span>
                </div>
              </div>
              <ul className={styles.priceFeatures}>
                {tPlans.raw('proFeatures').map((feature: string, index: number) => (
                  <li key={index} className={styles.priceFeatureItem}>
                    <Check size={16} className={styles.priceFeatureIcon} /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-primary btn-full btn-lg" style={{ marginTop: 'auto' }}>
                {t('pricing.proCta')}
              </Link>
            </div>

            {/* Ultimate Plan */}
            <div className={`${styles.priceCard} ${styles.priceCardUltimate}`}>
              <div className={styles.priceHeader}>
                <h3 className={styles.pricePlanName}>{t('pricing.ultimateName')}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.priceAmount}>{t('pricing.ultimatePrice')}</span>
                  <span className={styles.pricePeriod}>{t('pricing.ultimatePeriod')}</span>
                </div>
              </div>
              <ul className={styles.priceFeatures}>
                {tPlans.raw('ultimateFeatures').map((feature: string, index: number) => (
                  <li key={index} className={styles.priceFeatureItem}>
                    <Check size={16} className={styles.priceFeatureIcon} style={{ color: 'var(--success)' }} /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-primary btn-full btn-lg" style={{ marginTop: 'auto', background: 'var(--success)', borderColor: 'var(--success)', color: 'black' }}>
                {t('pricing.ultimateCta')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerBrandInfo}>
            <div className={styles.footerBrandName}>modclient.com</div>
            <p className={styles.footerBrandDesc}>{t('footer.desc')}</p>
          </div>
          <div className={styles.footerNav}>
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>{t('footer.product')}</span>
              <a href="#hero" className={styles.footerLink}>{t('footer.features')}</a>
              <a href="#" className={styles.footerLink}>{t('footer.roadmap')}</a>
              <a href="#" className={styles.footerLink}>{t('footer.changelog')}</a>
            </div>
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>{t('footer.resources')}</span>
              <Link href="/login" className={styles.footerLink}>{t('footer.docs')}</Link>
              <a href="#" className={styles.footerLink}>{t('footer.community')}</a>
              <a href="#" className={styles.footerLink}>{t('footer.api')}</a>
            </div>
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>{t('footer.company')}</span>
              <a href="#" className={styles.footerLink}>{t('footer.about')}</a>
              <a href="#" className={styles.footerLink}>{t('footer.contact')}</a>
              <a href="#" className={styles.footerLink}>{t('footer.legal')}</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © 2026 modclient.com // {t('footer.statusOperational')}
          </div>
        </div>
      </footer>
    </div>
  );
}
