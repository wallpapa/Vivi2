import { db } from '../server/db';
import { payments } from '../shared/schema';
import { between, eq } from 'drizzle-orm';

interface Staff {
  id: number;
  name: string;
  type: 'doctor' | 'therapist' | 'sales';
  isHighLevel?: boolean;
  workingHours?: number;
}

interface CommissionResult {
  commission: number;
  hourlyPay: number;
  method: string;
}

export async function calculateCommissionForStaff(
  staff: Staff,
  start: Date,
  end: Date
): Promise<CommissionResult> {
  try {
    const sales = await db
      .select()
      .from(payments)
      .where(between(payments.createdAt, start, end))
      .where(eq(payments.staffId, staff.id))
      .where(eq(payments.status, 'completed'));

    const revenue = sales.reduce((sum, p) => sum + p.total, 0);
    const hours = staff.workingHours || 1;

    if (staff.type === 'doctor') {
      const rate = staff.isHighLevel ? 1000 : 800;
      const base = hours * rate;
      const commission = revenue * 0.1; // 10% commission
      return {
        commission,
        hourlyPay: base,
        method: commission > base ? 'commission' : 'hourly'
      };
    }

    if (staff.type === 'sales') {
      return {
        commission: revenue * 0.01, // 1% commission
        hourlyPay: 0,
        method: '1% sales'
      };
    }

    if (staff.type === 'therapist') {
      const commission = revenue * 0.05; // 5% commission
      const hourly = hours * 500;
      return {
        commission,
        hourlyPay: hourly,
        method: commission > hourly ? 'commission' : 'hourly'
      };
    }

    return { commission: 0, hourlyPay: 0, method: 'none' };
  } catch (error) {
    console.error('Error calculating commission:', error);
    throw error;
  }
} 