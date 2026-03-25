'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { submitWorkLog } from '@/actions/work-log'
import type { PayProfile } from '@/actions/pay-profile'
import styles from './work-log-form.module.css'

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
    hoursLogged: '',
    airbnbCleans: '',
    kitchenCleans: '',
    dogWalks: '',
    expensesTotal: '',
    receiptUrls: [''],
  })

  // Calculate live payout estimate
  const estimatedPayout = useMemo(() => {
    let total = 0

    if (payProfile.hourlyRate) {
      total += (parseFloat(formData.hoursLogged) || 0) * payProfile.hourlyRate
    }

    if (payProfile.airbnbClean) {
      total += (parseInt(formData.airbnbCleans) || 0) * payProfile.airbnbClean
    }
    if (payProfile.kitchenClean) {
      total += (parseInt(formData.kitchenCleans) || 0) * payProfile.kitchenClean
    }
    if (payProfile.dogWalk) {
      total += (parseInt(formData.dogWalks) || 0) * payProfile.dogWalk
    }

    total += parseFloat(formData.expensesTotal) || 0

    if (payProfile.weeklyStipend) {
      total += payProfile.weeklyStipend
    }

    return total
  }, [formData, payProfile])

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
        hoursLogged: formData.hoursLogged ? parseFloat(formData.hoursLogged) : undefined,
        airbnbCleans: formData.airbnbCleans ? parseInt(formData.airbnbCleans) : undefined,
        kitchenCleans: formData.kitchenCleans ? parseInt(formData.kitchenCleans) : undefined,
        dogWalks: formData.dogWalks ? parseInt(formData.dogWalks) : undefined,
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
                  hoursLogged: '',
                  airbnbCleans: '',
                  kitchenCleans: '',
                  dogWalks: '',
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
              <CardTitle>Hours Logged</CardTitle>
              <CardDescription>
                {payProfile.hourlyRate 
                  ? `Enter total hours worked at $${payProfile.hourlyRate.toFixed(2)}/hr`
                  : 'Enter total hours worked'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                label="Hours"
                value={formData.hoursLogged}
                onChange={e => handleChange('hoursLogged', e.target.value)}
                placeholder="0"
                min="0"
                step="0.5"
              />
            </CardContent>
          </Card>
        </div>

        <div className={styles.fadeUpSection} style={{ animationDelay: '100ms' }}>
          <Card>
            <CardHeader>
              <CardTitle>Task Counts</CardTitle>
              <CardDescription>Enter the number of tasks completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.taskGrid}>
                <Input
                  type="number"
                  label={payProfile.airbnbClean ? `Airbnb Cleans ($${payProfile.airbnbClean.toFixed(2)} each)` : 'Airbnb Cleans'}
                  value={formData.airbnbCleans}
                  onChange={e => handleChange('airbnbCleans', e.target.value)}
                  placeholder="0"
                  min="0"
                />
                <Input
                  type="number"
                  label={payProfile.kitchenClean ? `Kitchen Cleans ($${payProfile.kitchenClean.toFixed(2)} each)` : 'Kitchen Cleans'}
                  value={formData.kitchenCleans}
                  onChange={e => handleChange('kitchenCleans', e.target.value)}
                  placeholder="0"
                  min="0"
                />
                <Input
                  type="number"
                  label={payProfile.dogWalk ? `Dog Walks ($${payProfile.dogWalk.toFixed(2)} each)` : 'Dog Walks'}
                  value={formData.dogWalks}
                  onChange={e => handleChange('dogWalks', e.target.value)}
                  placeholder="0"
                  min="0"
                />
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
