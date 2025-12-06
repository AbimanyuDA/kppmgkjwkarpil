import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/dashboard/stats
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total income and expense (approved only)
    const summaryResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE status = 'approved'
    `);

    // Get pending transactions count
    const pendingResult = await pool.query(`
      SELECT COUNT(*) as pending_count
      FROM transactions
      WHERE status = 'pending'
    `);

    // Get funds count
    const fundsResult = await pool.query('SELECT COUNT(*) as funds_count FROM funds');

    const stats = summaryResult.rows[0];
    const totalIncome = parseFloat(stats.total_income || 0);
    const totalExpense = parseFloat(stats.total_expense || 0);

    return NextResponse.json({
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        pendingTransactions: parseInt(pendingResult.rows[0].pending_count),
        totalFunds: parseInt(fundsResult.rows[0].funds_count),
      },
    });
  } catch (error: any) {
    console.error('[Dashboard Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats: ' + error.message },
      { status: 500 }
    );
  }
}
