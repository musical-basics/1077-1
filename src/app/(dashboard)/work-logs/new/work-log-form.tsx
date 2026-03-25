'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { submitWorkLog } from '@/actions/work-log'
import type { PayProfile } from '@/actions/pay-profile'
import styles from './work-log-form.module.css'

type DailyEntry = { hours: string; airbnb: string; kitchen: string; dog: string };

const createEmptyWeek = (): Record<string, DailyEntry> => {
  return {
    Mon: { hours: '', airbnb: '', kitchen: '', dog: '' },
    Tue: { hours: '', airbnb: '', kitchen: '', dog: '' },
    Wed: { hours: '', airbnb: '', kitchen: '', dog: '' },
    Thu: { hours: '', airbnb: '', kitchen: '', dog: '' },
    Fri: { hours: '', airbnb: '', kitchen: '', dog: '' },
    Sat: { hours: '', airbnb: '', kitchen: '', dog: '' },
    Sun: { hours: '', airbnb: '', kitchen: '', dog: '' },
  }
}

interface WorkLogFormProps {
  payProfile: PayProfile
}

export function WorkLogForm({ payProfile }: WorkLogFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ payout: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get the most recent Sunday
  const getLastSunday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + diff)
    return nextSunday.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    weekEnding: getLastSunday(),
    dailyData: createEmptyWeek(),
    expensesTotal: '',
    receiptUrls: [''],
  })

  const sums = useMemo(() => {
    let hours = 0, airbnb = 0, kitchen = 0, dog = 0
    Object.values(formData.dailyData).forEach(day => {
      hours += parseFloat(day.hours) || 0
      airbnb += parseInt(day.airbnb) || 0
      kitchen += parseInt(day.kitchen) || 0
      dog += parseInt(day.dog) || 0
    })
    return { hours, airbnb, kitchen, dog }
  }, [formData.dailyData])

  // Calculate live payout estimate
  const estimatedPayout = useMemo(() => {
    let total = 0

    if (payProfile.hourlyRate) {
      total += sums.hours * payProfile.hourlyRate
    }

    if (payProfile.airbnbClean) {
      total += sums.airbnb * payProfile.airbnbClean
    }
    if (payProfile.kitchenClean) {
      total += sums.kitchen * payProfile.kitchenClean
    }
    if (payProfile.dogWalk) {
      total += sums.dog * payProfile.dogWalk
    }

    total += parseFloat(formData.expensesTotal) || 0

    if (payProfile.weeklyStipend) {
      total += payProfile.weeklyStipend
    }

    return total
  }, [sums, formData.expensesTotal, payProfile])

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleDailyChange = useCallback((dayKey: string, field: keyof DailyEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      dailyData: {
        ...prev.dailyData,
        [dayKey]: {
          ...prev.dailyData[dayKey],
          [field]: value
        }
      }
    }))
  }, [])

  const handleReceiptChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newUrls = [...prev.receiptUrls]
      newUrls[index] = value
      return { ...prev, receiptUrls: newUrls }
    })
  }, [])

  const addReceiptUrl = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      receiptUrls: [...prev.receiptUrls, ''],
    }))
  }, [])

  const removeReceiptUrl = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      receiptUrls: prev.receiptUrls.filter((_, i) => i !== index),
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitWorkLog({
        weekEnding: formData.weekEnding,
        hoursLogged: sums.hours > 0 ? sums.hours : undefined,
        airbnbCleans: sums.airbnb > 0 ? sums.airbnb : undefined,
        kitchenCleans: sums.kitchen > 0 ? sums.kitchen : undefined,
        dogWalks: sums.dog > 0 ? sums.dog : undefined,
        expensesTotal: formData.expensesTotal ? parseFloat(formData.expensesTotal) : undefined,
        receiptUrls: formData.receiptUrls.filter(url => url.trim() !== ''),
      })

      if (result.success) {
        setSuccess({ payout: result.payout })
      }
    } catch {
      setError('Failed to submit work log. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card variant="highlight">
        <CardContent>
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Work Log Submitted!</h3>
            <p>Your work log has been successfully submitted.</p>
            <div className={styles.successPayout}>
              <span>Total Payout</span>
              <span className={styles.payoutAmount}>${success.payout.toFixed(2)}</span>
            </div>
            <div className={styles.successActions}>
              <Button onClick={() => router.push('/work-logs')}>
                View History
              </Button>
              <Button variant="secondary" onClick={() => {
                setSuccess(null)
                setFormData({
                  weekEnding: getLastSunday(),
                  dailyData: createEmptyWeek(),
                  expensesTotal: '',
                  receiptUrls: [''],
                })
              }}>
                Submit Another
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formLayout}>
      <div className={styles.formContent}>
        <div className={styles.fadeUpSection} style={{ animationDelay: '0ms' }}>
          <Card>
            <CardHeader>
              <CardTitle>Week Information</CardTitle>
              <CardDescription>Select the week ending date for this log</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                label="Week Ending (Sunday)"
                value={formData.weekEnding}
                onChange={e => handleChange('weekEnding', e.target.value)}
                required
              />
            </CardContent>
          </Card>
        </div>

        <div className={styles.fadeUpSection} style={{ animationDelay: '50ms' }}>
          <Card>
            <CardHeader>
              <CardTitle>Weekly Calendar Grid</CardTitle>
              <CardDescription>Enter hours and tasks for each day. Totals are calculated automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.calendarWrapper}>
                <table className={styles.calendarTable}>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Hours {payProfile.hourlyRate && <span className={styles.dayDate}>(${payProfile.hourlyRate.toFixed(2)}/hr)</span>}</th>
                      <th>Airbnb Cleans {payProfile.airbnbClean && <span className={styles.dayDate}>(${payProfile.airbnbClean.toFixed(2)} ea)</span>}</th>
                      <th>Kitchen Cleans {payProfile.kitchenClean && <span className={styles.dayDate}>(${payProfile.kitchenClean.toFixed(2)} ea)</span>}</th>
                      <th>Dog Walks {payProfile.dogWalk && <span className={styles.dayDate}>(${payProfile.dogWalk.toFixed(2)} ea)</span>}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(formData.dailyData).map(([dayKey, dayData]) => (
                      <tr key={dayKey}>
                        <td>
                          <span className={styles.dayLabel}>{dayKey}</span>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            className={styles.gridInput}
                            placeholder="0"
                            value={dayData.hours}
                            onChange={e => handleDailyChange(dayKey, 'hours', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className={styles.gridInput}
                            placeholder="0"
                            value={dayData.airbnb}
                            onChange={e => handleDailyChange(dayKey, 'airbnb', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className={styles.gridInput}
                            placeholder="0"
                            value={dayData.kitchen}
                            onChange={e => handleDailyChange(dayKey, 'kitchen', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className={styles.gridInput}
                            placeholder="0"
                            value={dayData.dog}
                            onChange={e => handleDailyChange(dayKey, 'dog', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                    <tr className={styles.totalRow}>
                      <td><span className={styles.dayLabel}>Totals</span></td>
                      <td className={styles.totalValue}>{sums.hours}</td>
                      <td className={styles.totalValue}>{sums.airbnb}</td>
                      <td className={styles.totalValue}>{sums.kitchen}</td>
                      <td className={styles.totalValue}>{sums.dog}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.fadeUpSection} style={{ animationDelay: '150ms' }}>
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>Add any work-related expenses for reimbursement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.expensesSection}>
                <Input
                  type="number"
                  label="Total Expenses ($)"
                  value={formData.expensesTotal}
                  onChange={e => handleChange('expensesTotal', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />

                <div className={styles.receipts}>
                  <label className={styles.receiptsLabel}>Receipt URLs (optional)</label>
                  {formData.receiptUrls.map((url, index) => (
                    <div key={index} className={styles.receiptRow}>
                      <Input
                        type="url"
                        value={url}
                        onChange={e => handleReceiptChange(index, e.target.value)}
                        placeholder="https://..."
                      />
                      {formData.receiptUrls.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removeReceiptUrl(index)}
                          aria-label="Remove receipt URL"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={addReceiptUrl}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Receipt URL
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Estimate Panel */}
      <div className={styles.stickySidebar}>
        <div className={styles.fadeUpSection} style={{ animationDelay: '200ms' }}>
          <Card variant="glass" className={styles.estimateCard}>
            <CardContent>
              <div className={styles.estimate}>
                <div className={styles.estimateIconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.estimateIcon}>
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className={styles.estimateDetails}>
                  <span className={styles.estimateLabel}>Estimated Payout</span>
                  <div className={styles.estimateValueWrapper}>
                    <span className={styles.currencySymbol}>$</span>
                    <span className={styles.estimateValue}>{estimatedPayout.toFixed(2)}</span>
                  </div>
                </div>
                {payProfile.weeklyStipend ? (
                  <p className={styles.estimateNote}>
                    Includes ${payProfile.weeklyStipend.toFixed(2)} weekly stipend
                  </p>
                ) : null}
              </div>

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              <Button type="submit" isLoading={isSubmitting} size="lg" className={styles.submitBtn}>
                Submit Work Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
