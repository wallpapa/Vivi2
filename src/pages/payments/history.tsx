import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';

interface PaymentItem {
  id: string;
  created_at: string;
  total_amount: number;
  patients: {
    name: string;
  };
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, patients(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return;
    }

    setPayments(data || []);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="border rounded p-4">
            <div>
              <p><strong>{payment.patients?.name}</strong></p>
              <p>{format(parseISO(payment.created_at), 'yyyy-MM-dd HH:mm')}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">฿{payment.total_amount.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 