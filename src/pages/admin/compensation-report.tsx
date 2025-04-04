import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format, parseISO, isBefore, isAfter } from 'date-fns';

interface Payment {
  id: string;
  created_at: string;
  total_amount: number;
  patients: {
    name: string;
  };
}

interface Filters {
  from: string;
  to: string;
}

export default function CompensationReport() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filters, setFilters] = useState<Filters>({
    from: '',
    to: '',
  });

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

  const applyFilter = () => {
    const f = payments.filter((r) => {
      const createdAt = parseISO(r.created_at);
      if (filters.from && isBefore(createdAt, parseISO(filters.from))) return false;
      if (filters.to && isAfter(createdAt, parseISO(filters.to))) return false;
      return true;
    });
    return f;
  };

  const filteredPayments = applyFilter();

  return (
    <div className="container mx-auto py-10">
      <div className="flex gap-4 mb-8">
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="border rounded p-2"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="border rounded p-2"
        />
      </div>
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
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