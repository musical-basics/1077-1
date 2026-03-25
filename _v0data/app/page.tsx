import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignInButton, Authenticated, Unauthenticated } from '@clerk/nextjs'
import Link from 'next/link'
import styles from './page.module.css'

export default async function LandingPage() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>1077</span>
            <span className={styles.logoDot}>.io</span>
          </Link>
          
          <nav className={styles.nav}>
            <Unauthenticated>
              <SignInButton mode="modal">
                <button className={styles.signInButton}>Sign In</button>
              </SignInButton>
            </Unauthenticated>
            <Authenticated>
              <Link href="/dashboard" className={styles.dashboardLink}>
                Dashboard
              </Link>
            </Authenticated>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          
          <div className={styles.heroContent}>
            <div className={styles.badge}>Contractor Portal</div>
            
            <h1 className={styles.title}>
              Manage work logs, payouts, and your team
            </h1>
            
            <p className={styles.subtitle}>
              A streamlined portal for contractors to log work, track earnings, 
              and manage payroll. Built for efficiency and transparency.
            </p>

            <div className={styles.cta}>
              <Unauthenticated>
                <SignInButton mode="modal">
                  <button className={styles.primaryButton}>
                    Get Started
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </SignInButton>
              </Unauthenticated>
              <Authenticated>
                <Link href="/dashboard" className={styles.primaryButton}>
                  Go to Dashboard
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </Authenticated>
            </div>
          </div>

          {/* Feature Cards */}
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Time Tracking</h3>
              <p className={styles.featureDescription}>
                Log hours and tasks with ease. Automatic payout calculations based on your pay profile.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Transparent Payouts</h3>
              <p className={styles.featureDescription}>
                See exactly how your pay is calculated. Track expenses and reimbursements.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Team Management</h3>
              <p className={styles.featureDescription}>
                Admins can manage team members, set pay rates, and run payroll reports.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          &copy; {new Date().getFullYear()} 1077.io. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
