import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  totalAmount: number
}

export default function PaymentModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  totalAmount
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            patient_id: patientId,
            total_amount: totalAmount,
            status: 'completed'
          }
        ])
        .select()

      if (error) throw error

      console.log('Payment successful:', data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Patient:</p>
            <p>{patientName}</p>
          </div>
          <div>
            <p className="font-semibold">Amount:</p>
            <p>฿{totalAmount.toLocaleString()}</p>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 