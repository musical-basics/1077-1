import { getUserById } from '@/actions/admin'
import { getPayProfileByUserId } from '@/actions/pay-profile'
import { getWorkLogsByUserId } from '@/actions/work-log'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/card'
import { Badge } from '@/components/badge'
import Link from 'next/link'
import { PayProfileForm } from './pay-profile-form'
import { PayoutCalculator } from './payout-calculator'
import styles from './page.module.css'

interface UserDetailPageProps {
  params: Promise<{ userId: string }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params
  const [user, payProfile, workLogs] = await Promise.all([
    getUserById(userId),
    getPayProfileByUserId(userId),
    getWorkLogsByUserId(userId),
  ])

  if (!user) {
    notFound()
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/admin/team" className={styles.backLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Team
        </Link>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className={styles.title}>{user.name || 'Unnamed User'}</h1>
            <p className={styles.email}>{user.email}</p>
          </div>
          <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Pay Profile Form */}
        <PayProfileForm userId={userId} payProfile={payProfile} />

        {/* Recent Work Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Work Logs</CardTitle>
            <CardDescription>Last 5 submitted work logs</CardDescription>
          </CardHeader>
          <CardContent>
            {workLogs.length > 0 ? (
              <div className={styles.logsList}>
                {workLogs.slice(0, 5).map(log => (
                  <div key={log.id} className={styles.logItem}>
                    <div className={styles.logDate}>
                      {new Date(log.weekEnding).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className={styles.logDetails}>
                      {log.hoursLogged && <span>{log.hoursLogged}h</span>}
                      {(log.airbnbCleans || log.kitchenCleans || log.dogWalks) && (
                        <span>
                          {(log.airbnbCleans ?? 0) + (log.kitchenCleans ?? 0) + (log.dogWalks ?? 0)} tasks
                        </span>
                      )}
                    </div>
                    <div className={styles.logPayout}>
                      ${log.totalPayout.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noLogs}>No work logs submitted yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout Calculator */}
      <PayoutCalculator userId={userId} />
    </div>
  )
}
