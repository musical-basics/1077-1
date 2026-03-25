import { getMyWorkLogs } from '@/actions/work-log'
import { Card } from '@/components/card'
import Link from 'next/link'
import styles from './page.module.css'

export default async function WorkLogsPage() {
  const workLogs = await getMyWorkLogs()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Work Log History</h1>
          <p className={styles.subtitle}>View all your submitted work logs</p>
        </div>
        <Link href="/work-logs/new" className={styles.newButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Work Log
        </Link>
      </header>

      {workLogs.length > 0 ? (
        <Card>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Week Ending</th>
                  <th>Hours Logged</th>
                  <th>Airbnb Cleans</th>
                  <th>Kitchen Cleans</th>
                  <th>Dog Walks</th>
                  <th>Expenses</th>
                  <th>Total Payout</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {workLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      {new Date(log.weekEnding).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className={styles.mono}>
                      {log.hoursLogged ?? '-'}
                    </td>
                    <td className={styles.mono}>
                      {log.airbnbCleans ?? '-'}
                    </td>
                    <td className={styles.mono}>
                      {log.kitchenCleans ?? '-'}
                    </td>
                    <td className={styles.mono}>
                      {log.dogWalks ?? '-'}
                    </td>
                    <td className={styles.mono}>
                      {log.expensesTotal ? `$${log.expensesTotal.toFixed(2)}` : '-'}
                    </td>
                    <td className={styles.payout}>
                      ${log.totalPayout.toFixed(2)}
                    </td>
                    <td className={styles.date}>
                      {new Date(log.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3>No work logs yet</h3>
            <p>Submit your first work log to start tracking your earnings.</p>
            <Link href="/work-logs/new" className={styles.emptyButton}>
              Submit Work Log
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
