import { getCurrentUser } from '@/actions/admin'
import { getMyPayProfile } from '@/actions/pay-profile'
import { getMyWorkLogs } from '@/actions/work-log'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/card'
import { Badge } from '@/components/badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import styles from './page.module.css'

export default async function DashboardPage() {
  const [user, payProfile, workLogs] = await Promise.all([
    getCurrentUser(),
    getMyPayProfile(),
    getMyWorkLogs(),
  ])

  if (!user) {
    redirect('/')
  }

  const thisWeekLogs = workLogs.filter(log => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(log.weekEnding) >= weekAgo
  })

  const thisWeekEarnings = thisWeekLogs.reduce((sum, log) => sum + log.totalPayout, 0)
  const totalEarnings = workLogs.reduce((sum, log) => sum + log.totalPayout, 0)

  return (
    <div className={styles.page}>
      {/* Welcome Section */}
      <section className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, {user.name?.split(' ')[0] || 'there'}
        </h1>
        <p className={styles.welcomeSubtitle}>
          Here&apos;s an overview of your work and earnings
        </p>
      </section>

      {/* Quick Stats */}
      <section className={styles.stats}>
        <Card variant="glass">
          <CardContent>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>This Week</span>
              <span className={styles.statValue}>
                ${thisWeekEarnings.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Earnings</span>
              <span className={styles.statValue}>
                ${totalEarnings.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Logs Submitted</span>
              <span className={styles.statValue}>{workLogs.length}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className={styles.grid}>
        {/* Pay Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pay Profile</CardTitle>
            <CardDescription>Your current pay configuration</CardDescription>
          </CardHeader>
          <CardContent>
            {payProfile ? (
              <div className={styles.payProfile}>
                <div className={styles.payRow}>
                  <span className={styles.payLabel}>Pay Type</span>
                  <Badge variant="info">
                    {payProfile.payType.charAt(0).toUpperCase() + payProfile.payType.slice(1)}
                  </Badge>
                </div>

                {(payProfile.payType === 'hourly' || payProfile.payType === 'hybrid') && payProfile.hourlyRate && (
                  <div className={styles.payRow}>
                    <span className={styles.payLabel}>Hourly Rate</span>
                    <span className={styles.payValue}>${payProfile.hourlyRate.toFixed(2)}/hr</span>
                  </div>
                )}

                {(payProfile.payType === 'task' || payProfile.payType === 'hybrid') && (
                  <>
                    {payProfile.airbnbClean && (
                      <div className={styles.payRow}>
                        <span className={styles.payLabel}>Airbnb Clean</span>
                        <span className={styles.payValue}>${payProfile.airbnbClean.toFixed(2)}</span>
                      </div>
                    )}
                    {payProfile.kitchenClean && (
                      <div className={styles.payRow}>
                        <span className={styles.payLabel}>Kitchen Clean</span>
                        <span className={styles.payValue}>${payProfile.kitchenClean.toFixed(2)}</span>
                      </div>
                    )}
                    {payProfile.dogWalk && (
                      <div className={styles.payRow}>
                        <span className={styles.payLabel}>Dog Walk</span>
                        <span className={styles.payValue}>${payProfile.dogWalk.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}

                {payProfile.weeklyStipend && (
                  <div className={styles.payRow}>
                    <span className={styles.payLabel}>Weekly Stipend</span>
                    <span className={styles.payValue}>${payProfile.weeklyStipend.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className={styles.emptyState}>No pay profile configured yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="highlight">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.actions}>
              <Link href="/work-logs/new" className={styles.actionButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Submit Work Log
              </Link>
              <Link href="/work-logs" className={styles.actionButtonSecondary}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                View History
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Work Logs */}
      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Work Logs</h2>
          <Link href="/work-logs" className={styles.viewAllLink}>
            View all
          </Link>
        </div>

        {workLogs.length > 0 ? (
          <Card>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Week Ending</th>
                    <th>Hours</th>
                    <th>Tasks</th>
                    <th>Expenses</th>
                    <th>Total Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {workLogs.slice(0, 5).map(log => (
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
                        {(log.airbnbCleans ?? 0) + (log.kitchenCleans ?? 0) + (log.dogWalks ?? 0) || '-'}
                      </td>
                      <td className={styles.mono}>
                        {log.expensesTotal ? `$${log.expensesTotal.toFixed(2)}` : '-'}
                      </td>
                      <td className={styles.payout}>
                        ${log.totalPayout.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <div className={styles.emptyState}>
                <p>No work logs submitted yet.</p>
                <Link href="/work-logs/new" className={styles.actionButton}>
                  Submit your first work log
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
