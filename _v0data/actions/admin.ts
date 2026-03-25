'use server'

import type { PayProfile } from './pay-profile'
import type { WorkLog } from './work-log'

export interface User {
  id: string
  clerkUserId: string
  email: string
  name: string | null
  role: 'assistant' | 'admin'
  payProfile: PayProfile | null
}

export interface WeeklySummary {
  user: User
  workLog: WorkLog | null
  totalHours: number
  totalTasks: number
  totalExpenses: number
  totalPayout: number
}

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: 'user_1',
    clerkUserId: 'clerk_1',
    email: 'sarah@1077.io',
    name: 'Sarah Chen',
    role: 'assistant',
    payProfile: {
      id: 'pp_1',
      userId: 'user_1',
      payType: 'hybrid',
      hourlyRate: 18.00,
      airbnbClean: 45.00,
      kitchenClean: 15.00,
      dogWalk: 12.00,
      weeklyStipend: 50.00,
    },
  },
  {
    id: 'user_2',
    clerkUserId: 'clerk_2',
    email: 'marcus@1077.io',
    name: 'Marcus Johnson',
    role: 'assistant',
    payProfile: {
      id: 'pp_2',
      userId: 'user_2',
      payType: 'hourly',
      hourlyRate: 22.00,
      airbnbClean: null,
      kitchenClean: null,
      dogWalk: null,
      weeklyStipend: null,
    },
  },
  {
    id: 'user_3',
    clerkUserId: 'clerk_3',
    email: 'elena@1077.io',
    name: 'Elena Rodriguez',
    role: 'assistant',
    payProfile: {
      id: 'pp_3',
      userId: 'user_3',
      payType: 'task',
      hourlyRate: null,
      airbnbClean: 50.00,
      kitchenClean: 18.00,
      dogWalk: 15.00,
      weeklyStipend: 25.00,
    },
  },
  {
    id: 'user_4',
    clerkUserId: 'clerk_4',
    email: 'admin@1077.io',
    name: 'Admin User',
    role: 'admin',
    payProfile: null,
  },
]

export async function listAllUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockUsers
}

export async function getUserById(userId: string): Promise<User | null> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockUsers.find(u => u.id === userId) ?? null
}

export async function getWeeklySummary(weekEnding: string): Promise<WeeklySummary[]> {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  return mockUsers
    .filter(user => user.role === 'assistant')
    .map(user => ({
      user,
      workLog: null,
      totalHours: Math.floor(Math.random() * 40) + 10,
      totalTasks: Math.floor(Math.random() * 15) + 3,
      totalExpenses: Math.floor(Math.random() * 100),
      totalPayout: Math.floor(Math.random() * 800) + 400,
    }))
}

export async function getCurrentUser(): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockUsers[0] // Return first user as current user for demo
}

export async function isAdmin(): Promise<boolean> {
  // In real app, this would check the current user's role
  return false
}
