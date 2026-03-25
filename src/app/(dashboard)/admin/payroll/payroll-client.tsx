'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Badge } from '@/components/badge'
import { calculateWeeklyPayout, type PayoutBreakdown } from '@/actions/calculate'
import type { WeeklySummary } from '@/actions/admin'
import styles from './payroll-client.module.css'

interface PayrollClientProps {
  initialWeek: string
  summary: WeeklySummary[]
  totals: {
    hours: number
    tasks: number
    expenses: number
    payout: number
  }
}

export function PayrollClient({ initialWeek, summary, totals }: PayrollClientProps) {
  const router = useRouter()
  const [weekEnding, setWeekEnding] = useState(initialWeek)
  const [calculating, setCalculating] = useState<string | null>(null)
  const [breakdowns, setBreakdowns] = useState<Record<string, PayoutBreakdown>>({})

  const handleWeekChange = (newWeek: string) => {
    setWeekEnding(newWeek)
    router.push(`/admin/payroll?week=${newWeek}`)
  }

  const handleCalculate = async (userId: string) => {
    setCalculating(userId)
    try {
      const result = await calculateWeeklyPayout(userId, weekEnding)
      setBreakdowns(prev => ({ ...prev, [userId]: result }))
    } catch (error) {
      console.error('Failed to calculate:', error)
    } finally {
      setCalculating(null)
    }
  }

  return (
    <div className={styles.container}>
      {/* Week Picker */}
      <Card>
        <CardContent>
          <div className={styles.weekPicker}>
            <Input
              type="date"
              label="Week Ending"
              value={weekEnding}
              onChange={e => handleWeekChange(e.target.value)}
            />
            <div className={styles.quickStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total Hours</span>
                <span className={styles.statValue}>{totals.hours}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total Tasks</span>
                <span className={styles.statValue}>{totals.tasks}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total Expenses</span>
                <span className={styles.statValue}>${totals.expenses.toFixed(2)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Grand Total</span>
                <span className={styles.statValueLarge}>${totals.payout.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Hours</th>
                <th>Tasks</th>
                <th>Expenses</th>
                <th>Total Payout</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {summary.map(item => (
                <>
                  <tr key={item.user.id}>
                    <td className={styles.name}>
                      <div className={styles.avatar}>
                        {item.user.name?.charAt(0).toUpperCase() || item.user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className={styles.nameText}>{item.user.name || 'Unnamed'}</span>
                        <span className={styles.email}>{item.user.email}</span>
                      </div>
                    </td>
                    <td className={styles.mono}>{item.totalHours}</td>
                    <td className={styles.mono}>{item.totalTasks}</td>
                    <td className={styles.mono}>${item.totalExpenses.toFixed(2)}</td>
                    <td className={styles.payout}>${item.totalPayout.toFixed(2)}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCalculate(item.user.id)}
                        isLoading={calculating === item.user.id}
                      >
                        {breakdowns[item.user.id] ? 'Recalculate' : 'Calculate'}
                      </Button>
                    </td>
                  </tr>
                  {breakdowns[item.user.id] && (
                    <tr className={styles.breakdownRow}>
                      <td colSpan={6}>
                        <div className={styles.breakdown}>
                          <div className={styles.breakdownHeader}>
                            <Badge variant="info">Breakdown</Badge>
                          </div>
                          <div className={styles.breakdownGrid}>
                            {breakdowns[item.user.id].breakdown.map((line, idx) => (
                              <div key={idx} className={styles.breakdownItem}>
                                <span>{line.label}</span>
                                <span className={styles.breakdownDetail}>
                                  {line.quantity} x ${line.rate.toFixed(2)}
                                </span>
                                <span className={styles.breakdownValue}>
                                  ${line.subtotal.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                <td>Grand Total</td>
                <td className={styles.mono}>{totals.hours}</td>
                <td className={styles.mono}>{totals.tasks}</td>
                <td className={styles.mono}>${totals.expenses.toFixed(2)}</td>
                <td className={styles.grandTotal}>${totals.payout.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
