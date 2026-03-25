'use server'

export interface WorkLog {
  id: string
  userId: string
  weekEnding: Date
  hoursLogged: number | null
  airbnbCleans: number | null
  kitchenCleans: number | null
  dogWalks: number | null
  expensesTotal: number | null
  receiptUrls: string[]
  totalPayout: number
  submittedAt: Date
}

export interface SubmitWorkLogData {
  weekEnding: string
  hoursLogged?: number
  airbnbCleans?: number
  kitchenCleans?: number
  dogWalks?: number
  expensesTotal?: number
  receiptUrls?: string[]
}

// Mock data for demonstration
const mockWorkLogs: WorkLog[] = [
  {
    id: '1',
    userId: 'user_1',
    weekEnding: new Date('2026-03-22'),
    hoursLogged: 32,
    airbnbCleans: 3,
    kitchenCleans: 5,
    dogWalks: 7,
    expensesTotal: 45.50,
    receiptUrls: [],
    totalPayout: 892.50,
    submittedAt: new Date('2026-03-20'),
  },
  {
    id: '2',
    userId: 'user_1',
    weekEnding: new Date('2026-03-15'),
    hoursLogged: 40,
    airbnbCleans: 4,
    kitchenCleans: 6,
    dogWalks: 10,
    expensesTotal: 23.00,
    receiptUrls: [],
    totalPayout: 1123.00,
    submittedAt: new Date('2026-03-13'),
  },
  {
    id: '3',
    userId: 'user_1',
    weekEnding: new Date('2026-03-08'),
    hoursLogged: 28,
    airbnbCleans: 2,
    kitchenCleans: 4,
    dogWalks: 5,
    expensesTotal: 0,
    receiptUrls: [],
    totalPayout: 710.00,
    submittedAt: new Date('2026-03-06'),
  },
]

export async function submitWorkLog(data: SubmitWorkLogData): Promise<{ success: boolean; payout: number }> {
  // Simulate server delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // In a real app, this would calculate payout based on user's pay profile
  const payout = (data.hoursLogged || 0) * 18 +
    (data.airbnbCleans || 0) * 45 +
    (data.kitchenCleans || 0) * 15 +
    (data.dogWalks || 0) * 12 +
    (data.expensesTotal || 0)
  
  return { success: true, payout }
}

export async function getMyWorkLogs(weekEnding?: string): Promise<WorkLog[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (weekEnding) {
    return mockWorkLogs.filter(log => 
      log.weekEnding.toISOString().split('T')[0] === weekEnding
    )
  }
  
  return mockWorkLogs
}

export async function getWorkLogsByUserId(userId: string): Promise<WorkLog[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockWorkLogs
}
