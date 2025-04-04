import { db } from '../server/db';
import { payrolls, staffs } from '../shared/schema';
import { format, parseISO } from 'date-fns';
import { eq } from 'drizzle-orm';
import { calculateCommissionForStaff } from '../lib/calculateCommissionForStaff';

export async function generatePayrollForMonth(startDate: string, endDate: string) {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const month = format(start, 'yyyy-MM');

    console.log(`🧾 Generating payroll for ${month}`);

    // Get all active staff
    const staffList = await db.select().from(staffs).where(eq(staffs.isActive, true));

    if (staffList.length === 0) {
      console.log('⚠️ No active staff found');
      return;
    }

    // Check if payroll already exists for this month
    const existingPayrolls = await db
      .select()
      .from(payrolls)
      .where(eq(payrolls.month, month));

    if (existingPayrolls.length > 0) {
      console.log(`⚠️ Payrolls already exist for ${month}. Skipping generation.`);
      return;
    }

    // Generate payroll for each staff
    for (const staff of staffList) {
      try {
        const { commission, hourlyPay, method } = await calculateCommissionForStaff(staff, start, end);

        const baseSalary = hourlyPay || 0;
        const totalAmount = Math.max(commission, baseSalary);

        await db.insert(payrolls).values({
          staffId: staff.id,
          staffType: staff.type,
          startDate,
          endDate,
          month,
          baseSalary,
          commission,
          totalAmount,
          notes: `Payroll for ${month} - ${method} based`
        });

        console.log(`✅ Payroll created: ${staff.name} = ฿${totalAmount.toLocaleString()}`);
      } catch (error) {
        console.error(`❌ Error generating payroll for ${staff.name}:`, error);
      }
    }

    console.log('🎉 All payrolls generated successfully!');
  } catch (error) {
    console.error('❌ Error generating payrolls:', error);
    throw error;
  }
} 