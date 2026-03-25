'use server'

export type PayType = 'hourly' | 'task' | 'hybrid'

export interface PayProfile {
  id: string
  userId: string
  payType: PayType
  hourlyRate: number | null
  airbnbClean: number | null
  kitchenClean: number | null
  dogWalk: number | null
  weeklyStipend: number | null
}

export interface UpsertPayProfileData {
  userId: string
  payType: PayType
  hourlyRate?: number
  airbnbClean?: number
  kitchenClean?: number
  dogWalk?: number
  weeklyStipend?: number
}

// Mock pay profile for demonstration
const mockPayProfile: PayProfile = {
  id: 'pp_1',
  userId: 'user_1',
  payType: 'hybrid',
  hourlyRate: 18.00,
  airbnbClean: 45.00,
  kitchenClean: 15.00,
  dogWalk: 12.00,
  weeklyStipend: 50.00,
}

export async function getMyPayProfile(): Promise<PayProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockPayProfile
}

export async function getPayProfileByUserId(userId: string): Promise<PayProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return { ...mockPayProfile, userId }
}

export async function upsertPayProfile(data: UpsertPayProfileData): Promise<PayProfile> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return {
    id: 'pp_' + Date.now(),
    userId: data.userId,
    payType: data.payType,
    hourlyRate: data.hourlyRate ?? null,
    airbnbClean: data.airbnbClean ?? null,
    kitchenClean: data.kitchenClean ?? null,
    dogWalk: data.dogWalk ?? null,
    weeklyStipend: data.weeklyStipend ?? null,
  }
}
