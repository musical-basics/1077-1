'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/card'
import { Button } from '@/components/button'
import { Input, Select } from '@/components/input'
import { upsertPayProfile, type PayProfile, type PayType } from '@/actions/pay-profile'
import styles from './pay-profile-form.module.css'

interface PayProfileFormProps {
  userId: string
  payProfile: PayProfile | null
}

export function PayProfileForm({ userId, payProfile }: PayProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    payType: (payProfile?.payType || 'hourly') as PayType,
    hourlyRate: payProfile?.hourlyRate?.toString() || '',
    airbnbClean: payProfile?.airbnbClean?.toString() || '',
    kitchenClean: payProfile?.kitchenClean?.toString() || '',
    dogWalk: payProfile?.dogWalk?.toString() || '',
    weeklyStipend: payProfile?.weeklyStipend?.toString() || '',
  })

  const showHourly = formData.payType === 'hourly' || formData.payType === 'hybrid'
  const showTasks = formData.payType === 'task' || formData.payType === 'hybrid'

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      await upsertPayProfile({
        userId,
        payType: formData.payType,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        airbnbClean: formData.airbnbClean ? parseFloat(formData.airbnbClean) : undefined,
        kitchenClean: formData.kitchenClean ? parseFloat(formData.kitchenClean) : undefined,
        dogWalk: formData.dogWalk ? parseFloat(formData.dogWalk) : undefined,
        weeklyStipend: formData.weeklyStipend ? parseFloat(formData.weeklyStipend) : undefined,
      })
      setSuccess(true)
    } catch {
      setError('Failed to update pay profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay Profile</CardTitle>
        <CardDescription>Configure how this contractor is compensated</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Select
            label="Pay Type"
            value={formData.payType}
            onChange={e => handleChange('payType', e.target.value)}
            options={[
              { value: 'hourly', label: 'Hourly' },
              { value: 'task', label: 'Task-based' },
              { value: 'hybrid', label: 'Hybrid (Hourly + Tasks)' },
            ]}
          />

          {showHourly && (
            <Input
              type="number"
              label="Hourly Rate ($)"
              value={formData.hourlyRate}
              onChange={e => handleChange('hourlyRate', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          )}

          {showTasks && (
            <>
              <Input
                type="number"
                label="Airbnb Clean Rate ($)"
                value={formData.airbnbClean}
                onChange={e => handleChange('airbnbClean', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <Input
                type="number"
                label="Kitchen Clean Rate ($)"
                value={formData.kitchenClean}
                onChange={e => handleChange('kitchenClean', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <Input
                type="number"
                label="Dog Walk Rate ($)"
                value={formData.dogWalk}
                onChange={e => handleChange('dogWalk', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </>
          )}

          <Input
            type="number"
            label="Weekly Stipend ($)"
            value={formData.weeklyStipend}
            onChange={e => handleChange('weeklyStipend', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            hint="Optional fixed amount added to each week's payout"
          />

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>Pay profile updated successfully!</div>}

          <Button type="submit" isLoading={isSubmitting}>
            Save Pay Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
