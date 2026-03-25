import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { isAdmin } from '@/actions/admin'
import styles from './layout.module.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  const userIsAdmin = await isAdmin()

  return (
    <div className={styles.layout}>
      <Sidebar isAdmin={userIsAdmin} />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}
