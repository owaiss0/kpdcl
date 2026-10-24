import type {
  Consumer, Bill, Payment, UsageRecord,
  NetMeterRecord, BillingRecord, TimeFilter
} from './types'
import { getStoredProfileUpdates, getStoredConnections } from '@/lib/storage'

// ── Demo Data ──────────────────────────────────────────────────────

const demoConsumers: Consumer[] = [
  {
    consumerNo: 'KPDCL-2024-001',
    name: 'Mohammad Irfan',
    address: 'House No. 42, Colony Road, Srinagar, J&K 190001',
    mobile: '9419000001',
    email: 'irfan@example.com',
    sanctionedLoad: 5,
    connectionType: 'domestic',
    category: 'PREPAID',
    meterSerialNo: 'KA-87321',
    accountId: '644-987-1234',
  },
  {
    consumerNo: 'KPDCL-2024-002',
    name: 'Fatima Begum',
    address: 'Shop No. 12, Main Bazaar, Anantnag, J&K 192101',
    mobile: '9419000002',
    email: 'fatima@example.com',
    sanctionedLoad: 10,
    connectionType: 'commercial',
    category: 'PREPAID',
    meterSerialNo: 'KA-87322',
    accountId: '644-987-5678',
  },
]

const demoBills: Bill[] = [
  {
    id: 'BILL-001',
    consumerNo: 'KPDCL-2024-001',
    name: 'Mohammad Irfan',
    address: 'House No. 42, Colony Road, Srinagar',
    amount: 1845.50,
    dueDate: '2026-07-15',
    status: 'unpaid',
    billPeriod: 'May 2026',
    billDate: '2026-06-01',
  },
  {
    id: 'BILL-002',
    consumerNo: 'KPDCL-2024-001',
    name: 'Mohammad Irfan',
    address: 'House No. 42, Colony Road, Srinagar',
    amount: 1620.00,
    dueDate: '2026-06-15',
    status: 'paid',
    billPeriod: 'Apr 2026',
    billDate: '2026-05-01',
  },
  {
    id: 'BILL-003',
    consumerNo: 'KPDCL-2024-001',
    name: 'Mohammad Irfan',
    address: 'House No. 42, Colony Road, Srinagar',
    amount: 2100.75,
    dueDate: '2026-05-15',
    status: 'paid',
    billPeriod: 'Mar 2026',
    billDate: '2026-04-01',
  },
  {
    id: 'BILL-004',
    consumerNo: 'KPDCL-2024-002',
    name: 'Fatima Begum',
    address: 'Shop No. 12, Main Bazaar, Anantnag',
    amount: 3450.00,
    dueDate: '2026-07-20',
    status: 'unpaid',
    billPeriod: 'May 2026',
    billDate: '2026-06-01',
  },
]

const demoPayments: Payment[] = [
  {
    id: 'PAY-001',
    consumerNo: 'KPDCL-2024-001',
    amount: 1620.00,
    paidAt: '2026-05-28T10:30:00Z',
    method: 'online',
    transactionId: 'TXN-987654',
    billId: 'BILL-002',
  },
  {
    id: 'PAY-002',
    consumerNo: 'KPDCL-2024-001',
    amount: 2100.75,
    paidAt: '2026-04-25T14:15:00Z',
    method: 'online',
    transactionId: 'TXN-987123',
    billId: 'BILL-003',
  },
  {
    id: 'PAY-003',
    consumerNo: 'KPDCL-2024-001',
    amount: 500.00,
    paidAt: '2026-06-10T09:00:00Z',
    method: 'online',
    transactionId: 'TXN-987456',
    billId: 'RCH-001',
  },
]

const demoUsageRecords: UsageRecord[] = [
  { id: 'USG-001', consumerNo: 'KPDCL-2024-001', date: '2026-06-01', unitConsumed: 12, openingRead: 1450, closingRead: 1462 },
  { id: 'USG-002', consumerNo: 'KPDCL-2024-001', date: '2026-06-02', unitConsumed: 10, openingRead: 1462, closingRead: 1472 },
  { id: 'USG-003', consumerNo: 'KPDCL-2024-001', date: '2026-06-03', unitConsumed: 14, openingRead: 1472, closingRead: 1486 },
  { id: 'USG-004', consumerNo: 'KPDCL-2024-001', date: '2026-06-04', unitConsumed: 9, openingRead: 1486, closingRead: 1495 },
  { id: 'USG-005', consumerNo: 'KPDCL-2024-001', date: '2026-06-05', unitConsumed: 15, openingRead: 1495, closingRead: 1510 },
  { id: 'USG-006', consumerNo: 'KPDCL-2024-001', date: '2026-06-06', unitConsumed: 11, openingRead: 1510, closingRead: 1521 },
  { id: 'USG-007', consumerNo: 'KPDCL-2024-001', date: '2026-06-07', unitConsumed: 13, openingRead: 1521, closingRead: 1534 },
  { id: 'USG-008', consumerNo: 'KPDCL-2024-001', date: '2026-06-08', unitConsumed: 8, openingRead: 1534, closingRead: 1542 },
  { id: 'USG-009', consumerNo: 'KPDCL-2024-001', date: '2026-06-09', unitConsumed: 16, openingRead: 1542, closingRead: 1558 },
  { id: 'USG-010', consumerNo: 'KPDCL-2024-001', date: '2026-06-10', unitConsumed: 10, openingRead: 1558, closingRead: 1568 },
]

const demoNetMeterRecords: NetMeterRecord[] = [
  { id: 'NET-001', consumerNo: 'KPDCL-2024-001', date: '2026-06-01', startImp: 800, endImp: 812, totalImp: 12, startExp: 200, endExp: 205, totalExp: 5, netUsage: 7 },
  { id: 'NET-002', consumerNo: 'KPDCL-2024-001', date: '2026-06-02', startImp: 812, endImp: 820, totalImp: 8, startExp: 205, endExp: 212, totalExp: 7, netUsage: 1 },
  { id: 'NET-003', consumerNo: 'KPDCL-2024-001', date: '2026-06-03', startImp: 820, endImp: 835, totalImp: 15, startExp: 212, endExp: 218, totalExp: 6, netUsage: 9 },
  { id: 'NET-004', consumerNo: 'KPDCL-2024-001', date: '2026-06-04', startImp: 835, endImp: 842, totalImp: 7, startExp: 218, endExp: 228, totalExp: 10, netUsage: -3 },
  { id: 'NET-005', consumerNo: 'KPDCL-2024-001', date: '2026-06-05', startImp: 842, endImp: 858, totalImp: 16, startExp: 228, endExp: 232, totalExp: 4, netUsage: 12 },
  { id: 'NET-006', consumerNo: 'KPDCL-2024-001', date: '2026-06-06', startImp: 858, endImp: 868, totalImp: 10, startExp: 232, endExp: 240, totalExp: 8, netUsage: 2 },
  { id: 'NET-007', consumerNo: 'KPDCL-2024-001', date: '2026-06-07', startImp: 868, endImp: 882, totalImp: 14, startExp: 240, endExp: 248, totalExp: 8, netUsage: 6 },
  { id: 'NET-008', consumerNo: 'KPDCL-2024-001', date: '2026-06-08', startImp: 882, endImp: 888, totalImp: 6, startExp: 248, endExp: 260, totalExp: 12, netUsage: -6 },
  { id: 'NET-009', consumerNo: 'KPDCL-2024-001', date: '2026-06-09', startImp: 888, endImp: 906, totalImp: 18, startExp: 260, endExp: 265, totalExp: 5, netUsage: 13 },
  { id: 'NET-010', consumerNo: 'KPDCL-2024-001', date: '2026-06-10', startImp: 906, endImp: 916, totalImp: 10, startExp: 265, endExp: 274, totalExp: 9, netUsage: 1 },
]

const demoBillingRecords: BillingRecord[] = [
  { id: 'BL-001', consumerNo: 'KPDCL-2024-001', date: '2026-06-10', transactionId: 'TXN-987456', transactionType: 'recharge', transactionAmount: 500, availableBalance: 500 },
  { id: 'BL-002', consumerNo: 'KPDCL-2024-001', date: '2026-05-28', transactionId: 'TXN-987654', transactionType: 'payment', transactionAmount: -1620, availableBalance: 0 },
  { id: 'BL-003', consumerNo: 'KPDCL-2024-001', date: '2026-05-25', transactionId: 'TXN-987321', transactionType: 'recharge', transactionAmount: 2000, availableBalance: 1620 },
  { id: 'BL-004', consumerNo: 'KPDCL-2024-001', date: '2026-04-25', transactionId: 'TXN-987123', transactionType: 'payment', transactionAmount: -2100.75, availableBalance: 0 },
  { id: 'BL-005', consumerNo: 'KPDCL-2024-001', date: '2026-04-20', transactionId: 'TXN-987000', transactionType: 'recharge', transactionAmount: 2500, availableBalance: 2100.75 },
]

// ── Async Fetchers (swap body to real API later) ──────────────────

function withProfileUpdates(consumer: Consumer): Consumer {
  const updates = getStoredProfileUpdates(consumer.consumerNo)
  if (!updates) return consumer
  return {
    ...consumer,
    mobile: updates.mobile || consumer.mobile,
    email: updates.email || consumer.email,
  }
}

export async function fetchConsumerByNo(no: string): Promise<Consumer | null> {
  if (!no || no === "undefined" || no === "null" || no === "portal") {
    return withProfileUpdates(demoConsumers[0])
  }
  const match = demoConsumers.find(c => c.consumerNo.toLowerCase() === no.toLowerCase())
  if (match) return withProfileUpdates(match)

  // Check localStorage for custom linked consumers
  const storedConnections = getStoredConnections()
  if (storedConnections) {
    const found = storedConnections.find((p) => p.consumerNo?.toLowerCase() === no.toLowerCase())
    if (found) {
      const typeStr = found.type?.toLowerCase()
      const connType = (typeStr === "commercial" || typeStr === "industrial") ? typeStr : "domestic"
      const customConsumer: Consumer = {
        consumerNo: found.consumerNo,
        name: found.name,
        address: found.address || "House No. 12, Main Road, Srinagar, J&K",
        mobile: "9419000002",
        email: "consumer@example.com",
        sanctionedLoad: 5,
        connectionType: connType,
        category: "PREPAID",
        meterSerialNo: `KA-${found.consumerNo.slice(-5) || "88219"}`,
        accountId: `644-987-${found.consumerNo.slice(-4) || "4321"}`,
      }
      return withProfileUpdates(customConsumer)
    }
  }

  // Safe fallback so no consumer ID ever causes a blank page or 404
  return withProfileUpdates({
    ...demoConsumers[0],
    consumerNo: no,
  })
}

export async function fetchCurrentBill(consumerNo: string): Promise<Bill | null> {
  const match = demoBills.find(b => b.consumerNo === consumerNo && b.status === 'unpaid')
  if (match) return match
  return demoBills.find(b => b.status === 'unpaid') ?? null
}

export async function fetchBillHistory(consumerNo: string): Promise<Bill[]> {
  const filtered = demoBills.filter(b => b.consumerNo === consumerNo)
  if (filtered.length > 0) {
    return filtered.sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())
  }
  return demoBills
}

export async function fetchRecentPayments(consumerNo: string): Promise<Payment[]> {
  const filtered = demoPayments.filter(p => p.consumerNo === consumerNo)
  if (filtered.length > 0) {
    return filtered.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
  }
  return demoPayments.slice(0, 4)
}

export async function submitPayment(billId: string, amount: number): Promise<Payment> {
  // DEMO: simulate payment with snappy feedback
  await new Promise(r => setTimeout(r, 400))
  return {
    id: `PAY-${Date.now()}`,
    consumerNo: 'KPDCL-2024-001',
    amount,
    paidAt: new Date().toISOString(),
    method: 'online',
    transactionId: `TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    billId,
  }
}

export async function fetchUsageRecords(
  consumerNo: string,
  filter: TimeFilter = 'daily'
): Promise<UsageRecord[]> {
  if (filter === 'daily') {
    const filtered = demoUsageRecords.filter(r => r.consumerNo === consumerNo)
    if (filtered.length > 0) return filtered
    return demoUsageRecords.map(r => ({ ...r, consumerNo }))
  }

  const records: UsageRecord[] = []
  let baseRead = 1450 // Starting meter reading

  if (filter === 'hourly') {
    // Generate 24 hourly records for the day June 10, 2026
    for (let hour = 0; hour < 24; hour++) {
      const padHour = String(hour).padStart(2, '0')
      const dateStr = `2026-06-10T${padHour}:00:00Z`
      const unit = parseFloat((Math.random() * 1.4 + 0.2).toFixed(2)) // 0.2 to 1.6 units per hour
      records.push({
        id: `USG-HR-${hour}`,
        consumerNo,
        date: dateStr,
        unitConsumed: unit,
        openingRead: parseFloat(baseRead.toFixed(2)),
        closingRead: parseFloat((baseRead + unit).toFixed(2))
      })
      baseRead += unit
    }
  } else if (filter === 'weekly') {
    // Generate 8 weekly records starting from April 20, 2026
    const startDate = new Date("2026-04-20")
    for (let w = 0; w < 8; w++) {
      const dateStr = new Date(startDate.getTime() + w * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const unit = parseFloat((Math.random() * 25 + 65).toFixed(1)) // 65 to 90 units per week
      records.push({
        id: `USG-WK-${w}`,
        consumerNo,
        date: dateStr,
        unitConsumed: unit,
        openingRead: parseFloat(baseRead.toFixed(1)),
        closingRead: parseFloat((baseRead + unit).toFixed(1))
      })
      baseRead += unit
    }
  } else if (filter === 'monthly') {
    // Generate 12 monthly records for the past year
    const startDate = new Date("2025-07-01")
    for (let m = 0; m < 12; m++) {
      const dateStr = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1).toISOString().split('T')[0]
      const unit = Math.floor(Math.random() * 80 + 260) // 260 to 340 units per month
      records.push({
        id: `USG-MO-${m}`,
        consumerNo,
        date: dateStr,
        unitConsumed: unit,
        openingRead: Math.floor(baseRead),
        closingRead: Math.floor(baseRead + unit)
      })
      baseRead += unit
    }
  } else if (filter === 'yearly') {
    // Generate 3 years: 2024, 2025, 2026
    const years = ["2024-01-01", "2025-01-01", "2026-01-01"]
    years.forEach((yrStr, y) => {
      const unit = Math.floor(Math.random() * 800 + 3200) // 3200 to 4000 units per year
      records.push({
        id: `USG-YR-${y}`,
        consumerNo,
        date: yrStr,
        unitConsumed: unit,
        openingRead: Math.floor(baseRead),
        closingRead: Math.floor(baseRead + unit)
      })
      baseRead += unit
    })
  }

  return records
}

export async function fetchNetMeterRecords(
  consumerNo: string,
  filter: TimeFilter = 'daily'
): Promise<NetMeterRecord[]> {
  if (filter === 'daily') {
    const filtered = demoNetMeterRecords.filter(r => r.consumerNo === consumerNo)
    if (filtered.length > 0) return filtered
    return demoNetMeterRecords.map(r => ({ ...r, consumerNo }))
  }

  const records: NetMeterRecord[] = []
  let baseImp = 800 // Base import reading
  let baseExp = 200 // Base export reading

  if (filter === 'hourly') {
    // Generate 24 hourly net meter records for June 10, 2026
    for (let hour = 0; hour < 24; hour++) {
      const padHour = String(hour).padStart(2, '0')
      const dateStr = `2026-06-10T${padHour}:00:00Z`
      
      const imp = parseFloat((Math.random() * 0.8 + 0.3).toFixed(2)) // Import is fairly constant
      // Export (solar generation) is high between 9 AM (09:00) and 4 PM (16:00), and 0 at night
      let exp = 0
      if (hour >= 9 && hour <= 16) {
        exp = parseFloat((Math.random() * 1.5 + 0.6).toFixed(2))
      }

      const net = parseFloat((imp - exp).toFixed(2))
      records.push({
        id: `NET-HR-${hour}`,
        consumerNo,
        date: dateStr,
        startImp: parseFloat(baseImp.toFixed(2)),
        endImp: parseFloat((baseImp + imp).toFixed(2)),
        totalImp: imp,
        startExp: parseFloat(baseExp.toFixed(2)),
        endExp: parseFloat((baseExp + exp).toFixed(2)),
        totalExp: exp,
        netUsage: net
      })
      baseImp += imp
      baseExp += exp
    }
  } else if (filter === 'weekly') {
    // Generate 8 weekly records starting from April 20, 2026
    const startDate = new Date("2026-04-20")
    for (let w = 0; w < 8; w++) {
      const dateStr = new Date(startDate.getTime() + w * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const imp = parseFloat((Math.random() * 20 + 55).toFixed(1))
      const exp = parseFloat((Math.random() * 25 + 30).toFixed(1))
      const net = parseFloat((imp - exp).toFixed(1))
      records.push({
        id: `NET-WK-${w}`,
        consumerNo,
        date: dateStr,
        startImp: parseFloat(baseImp.toFixed(1)),
        endImp: parseFloat((baseImp + imp).toFixed(1)),
        totalImp: imp,
        startExp: parseFloat(baseExp.toFixed(1)),
        endExp: parseFloat((baseExp + exp).toFixed(1)),
        totalExp: exp,
        netUsage: net
      })
      baseImp += imp
      baseExp += exp
    }
  } else if (filter === 'monthly') {
    // Generate 12 monthly records for the past year
    const startDate = new Date("2025-07-01")
    for (let m = 0; m < 12; m++) {
      const dateStr = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1).toISOString().split('T')[0]
      const imp = Math.floor(Math.random() * 100 + 240)
      const exp = Math.floor(Math.random() * 120 + 150)
      const net = imp - exp
      records.push({
        id: `NET-MO-${m}`,
        consumerNo,
        date: dateStr,
        startImp: Math.floor(baseImp),
        endImp: Math.floor(baseImp + imp),
        totalImp: imp,
        startExp: Math.floor(baseExp),
        endExp: Math.floor(baseExp + exp),
        totalExp: exp,
        netUsage: net
      })
      baseImp += imp
      baseExp += exp
    }
  } else if (filter === 'yearly') {
    // Generate 3 years: 2024, 2025, 2026
    const years = ["2024-01-01", "2025-01-01", "2026-01-01"]
    years.forEach((yrStr, y) => {
      const imp = Math.floor(Math.random() * 1000 + 3000)
      const exp = Math.floor(Math.random() * 1200 + 2000)
      const net = imp - exp
      records.push({
        id: `NET-YR-${y}`,
        consumerNo,
        date: yrStr,
        startImp: Math.floor(baseImp),
        endImp: Math.floor(baseImp + imp),
        totalImp: imp,
        startExp: Math.floor(baseExp),
        endExp: Math.floor(baseExp + exp),
        totalExp: exp,
        netUsage: net
      })
      baseImp += imp
      baseExp += exp
    })
  }

  return records
}

export async function fetchBillingRecords(consumerNo: string): Promise<BillingRecord[]> {
  // DEMO: return mock data with safe fallback for any linked consumer
  const filtered = demoBillingRecords.filter(r => r.consumerNo === consumerNo)
  if (filtered.length > 0) {
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  return demoBillingRecords.map(r => ({ ...r, consumerNo })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
