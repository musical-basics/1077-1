'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { calculateWeeklyPayout, type PayoutBreakdown } from '@/actions/calculate'
import styles from './payout-calculator.module.css'

interface PayoutCalculatorProps {
  userId: string
}

export function PayoutCalculator({ userId }: PayoutCalculatorProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [breakdown, setBreakdown] = useState<PayoutBreakdown | null>(null)
  
  // Get the most recent Sunday
  const getLastSunday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + diff)
    return nextSunday.toISOString().split('T')[0]
  }

  const [weekEnding, setWeekEnding] = useState(getLastSunday())

  const handleCalculate = async () => {
    setIsCalculating(true)
    try {
      const result = await calculateWeeklyPayout(userId, weekEnding)
      setBreakdown(result)
    } catch (error) {
      console.error('Failed to calculate payout:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Calculator</CardTitle>
        <CardDescription>Calculate detailed payout breakdown for a specific week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={styles.calculator}>
          <div className={styles.controls}>
            <Input
              type="date"
              label="Week Ending"
              value={weekEnding}
              onChange={e => setWeekEnding(e.target.value)}
            />
            <Button onClick={handleCalculate} isLoading={isCalculating}>
              Calculate
            </Button>
          </div>

          {breakdown && (
            <div className={styles.breakdown}>
              <h4 className={styles.breakdownTitle}>Breakdown</h4>
              <div className={styles.breakdownList}>
                {breakdown.breakdown.map((item, index) => (
                  <div key={index} className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>{item.label}</span>
                    <span className={styles.breakdownDetail}>
                      {item.quantity} x ${item.rate.toFixed(2)}
                    </span>
                    <span className={styles.breakdownValue}>
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.total}>
                <span>Total Payout</span>
                <span className={styles.totalValue}>
                  ${breakdown.totalPayout.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
