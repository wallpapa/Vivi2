export interface TestItem {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Setting {
  key: string
  value: number
}

export interface Payment {
  id: string
  created_at: string
  staff_name: string
  role: 'doctor' | 'therapist' | 'ambassador'
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
}

export interface Database {
  public: {
    Tables: {
      test: {
        Row: TestItem
        Insert: Omit<TestItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TestItem, 'id' | 'created_at' | 'updated_at'>>
      }
      settings: {
        Row: Setting
        Insert: Setting
        Update: Setting
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>
      }
    }
  }
} 