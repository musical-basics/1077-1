import { listAllUsers } from '@/actions/admin'
import { Card } from '@/components/card'
import { Badge } from '@/components/badge'
import Link from 'next/link'
import { AddMemberButton } from './team-header'
import styles from './page.module.css'

export default async function TeamPage() {
  const users = await listAllUsers()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Team Management</h1>
          <p className={styles.subtitle}>Manage team members and pay profiles</p>
        </div>
        <AddMemberButton />
      </header>

      <Card>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Pay Type</th>
                <th>Pay Rate</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className={styles.name}>
                    <div className={styles.avatar}>
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name || 'Unnamed'}</span>
                  </td>
                  <td className={styles.email}>{user.email}</td>
                  <td>
                    <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    {user.payProfile ? (
                      <span className={styles.payType}>
                        {user.payProfile.payType.charAt(0).toUpperCase() + user.payProfile.payType.slice(1)}
                      </span>
                    ) : (
                      <span className={styles.notConfigured}>Not configured</span>
                    )}
                  </td>
                  <td>
                    {user.payProfile ? (
                      <span className={styles.mono}>
                        {user.payProfile.payType === 'hourly' && `$${user.payProfile.hourlyRate?.toFixed(2) || '0.00'}/hr`}
                        {user.payProfile.payType === 'hybrid' && `$${user.payProfile.hourlyRate?.toFixed(2) || '0.00'}/hr + Tasks`}
                        {user.payProfile.payType === 'task' && 'Task-based'}
                      </span>
                    ) : (
                      <span className={styles.notConfigured}>-</span>
                    )}
                  </td>
                  <td>
                    <Badge variant={user.payProfile ? 'success' : 'warning'}>
                      {user.payProfile ? 'Active' : 'Pending'}
                    </Badge>
                  </td>
                  <td>
                    <Link href={`/admin/team/${user.id}`} className={styles.viewLink}>
                      View
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
