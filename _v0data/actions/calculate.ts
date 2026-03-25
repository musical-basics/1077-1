'use server'

export interface PayoutBreakdown {
  userId: string
  weekEnding: string
  hourlyPay: number
  taskPay: number
  expenses: number
  stipend: number
  totalPayout: number
  breakdown: {
    label: string
    quantity: number
    rate: number
    subtotal: number
  }[]
}

export async function calculateWeeklyPayout(
  userId: string,
  weekEnding: string
): Promise<PayoutBreakdown> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Mock calculation
  const hourlyPay = 576.00 // 32 hours * $18
  const airbnbPay = 135.00 // 3 cleans * $45
  const kitchenPay = 75.00 // 5 cleans * $15
  const dogWalkPay = 84.00 // 7 walks * $12
  const expenses = 45.50
  const stipend = 50.00
  
  return {
    userId,
    weekEnding,
    hourlyPay,
    taskPay: airbnbPay + kitchenPay + dogWalkPay,
    expenses,
    stipend,
    totalPayout: hourlyPay + airbnbPay + kitchenPay + dogWalkPay + expenses + stipend,
    breakdown: [
      { label: 'Hourly Work', quantity: 32, rate: 18.00, subtotal: hourlyPay },
      { label: 'Airbnb Cleans', quantity: 3, rate: 45.00, subtotal: airbnbPay },
      { label: 'Kitchen Cleans', quantity: 5, rate: 15.00, subtotal: kitchenPay },
      { label: 'Dog Walks', quantity: 7, rate: 12.00, subtotal: dogWalkPay },
      { label: 'Expenses', quantity: 1, rate: expenses, subtotal: expenses },
      { label: 'Weekly Stipend', quantity: 1, rate: stipend, subtotal: stipend },
    ],
  }
}

export async function estimatePayout(data: {
  payType: 'hourly' | 'task' | 'hybrid'
  hourlyRate?: number
  hoursLogged?: number
  airbnbClean?: number
  airbnbCleans?: number
  kitchenClean?: number
  kitchenCleans?: number
  dogWalk?: number
  dogWalks?: number
  expenses?: number
  weeklyStipend?: number
}): Promise<number> {
  let total = 0
  
  if (data.payType === 'hourly' || data.payType === 'hybrid') {
    total += (data.hourlyRate || 0) * (data.hoursLogged || 0)
  }
  
  if (data.payType === 'task' || data.payType === 'hybrid') {
    total += (data.airbnbClean || 0) * (data.airbnbCleans || 0)
    total += (data.kitchenClean || 0) * (data.kitchenCleans || 0)
    total += (data.dogWalk || 0) * (data.dogWalks || 0)
  }
  
  total += data.expenses || 0
  total += data.weeklyStipend || 0
  
  return total
}
