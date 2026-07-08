export type ConnectionType = 'domestic' | 'commercial' | 'industrial'

export type ConsumerCategory = 'PREPAID' | 'POSTPAID'

export type Consumer = {
  consumerNo: string
  name: string
  address: string
  mobile: string
  email: string
  sanctionedLoad: number
  connectionType: ConnectionType
  category: ConsumerCategory
  meterSerialNo: string
  accountId: string
}

export type BillStatus = 'paid' | 'unpaid' | 'overdue'

export type Bill = {
  id: string
  consumerNo: string
  name: string
  address: string
  amount: number
  dueDate: string
  status: BillStatus
  billPeriod: string
  billDate: string
  pdfUrl?: string
}

export type PaymentMethod = 'online' | 'cash' | 'bank'

export type Payment = {
  id: string
  consumerNo: string
  amount: number
  paidAt: string
  method: PaymentMethod
  transactionId: string
  billId: string
}

export type UsageRecord = {
  id: string
  consumerNo: string
  date: string
  unitConsumed: number
  openingRead: number
  closingRead: number
}

export type NetMeterRecord = {
  id: string
  consumerNo: string
  date: string
  startImp: number
  endImp: number
  totalImp: number
  startExp: number
  endExp: number
  totalExp: number
  netUsage: number
}

export type TransactionType = 'payment' | 'recharge' | 'refund'

export type BillingRecord = {
  id: string
  consumerNo: string
  date: string
  transactionId: string
  transactionType: TransactionType
  transactionAmount: number
  availableBalance: number
}

export type TimeFilter = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
