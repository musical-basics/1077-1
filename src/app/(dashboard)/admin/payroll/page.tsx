import { getWeeklyPayrollSummary } from '@/actions/admin'
import { PayrollClient } from './payroll-client'
import styles from './page.module.css'

// Get the most recent Sunday
function getLastSunday() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + diff)
  return nextSunday.toISOString().split('T')[0]
}

interface PayrollPageProps {
  searchParams: Promise<{ week?: string }>
}

export default async function PayrollPage({ searchParams }: PayrollPageProps) {
  const params = await searchParams
  const weekEnding = params.week || getLastSunday()
  const summary = await getWeeklyPayrollSummary(weekEnding)

  const totals = summary.reduce(
    (acc, item) => ({
      hours: acc.hours + item.totalHours,
      tasks: acc.tasks + item.totalTasks,
      expenses: acc.expenses + item.totalExpenses,
      payout: acc.payout + item.totalPayout,
    }),
    { hours: 0, tasks: 0, expenses: 0, payout: 0 }
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Payroll</h1>
          <p className={styles.subtitle}>Weekly payout summary and breakdown</p>
        </div>
      </header>

      <PayrollClient 
        initialWeek={weekEnding} 
        summary={summary} 
        totals={totals}
      />
    </div>
  )
}
