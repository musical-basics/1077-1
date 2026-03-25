import { getMyPayProfile } from '@/actions/pay-profile'
import { WorkLogForm } from './work-log-form'
import styles from './page.module.css'

export default async function NewWorkLogPage() {
  const payProfile = await getMyPayProfile()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Submit Work Log</h1>
        <p className={styles.subtitle}>
          Log your hours, tasks, and expenses for the week
        </p>
      </header>

      {payProfile ? (
        <WorkLogForm payProfile={payProfile} />
      ) : (
        <div className={styles.noProfile}>
          <div className={styles.noProfileIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Pay Profile Required</h3>
          <p>
            Your pay profile hasn&apos;t been configured yet. Please contact an admin
            to set up your pay rates before submitting work logs.
          </p>
        </div>
      )}
    </div>
  )
}
