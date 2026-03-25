'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/card'
import { Button } from '@/components/button'
import { Input, Select } from '@/components/input'
import { addTeamMember } from '@/actions/admin'
import styles from './add-member-form.module.css'

interface AddMemberFormProps {
  onClose: () => void
}

export function AddMemberForm({ onClose }: AddMemberFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'assistant',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await addTeamMember({
        email: formData.email,
        name: formData.name || null,
        role: formData.role,
      })
      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <Card>
          <CardHeader>
            <div className={styles.modalHeader}>
              <div>
                <CardTitle>Add Team Member</CardTitle>
                <CardDescription>Create a new contractor account</CardDescription>
              </div>
              <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="contractor@example.com"
                required
              />
              <Input
                type="text"
                label="Full Name"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="John Doe"
              />
              <Select
                label="Role"
                value={formData.role}
                onChange={e => handleChange('role', e.target.value)}
                options={[
                  { value: 'assistant', label: 'Contractor' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.actions}>
                <Button variant="secondary" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Add Member
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
