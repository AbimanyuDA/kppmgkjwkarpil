import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/dashboard/monthly
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get monthly income and expense for the last 12 months
    const result = await pool.query(`
      SELECT 
        TO_CHAR(transaction_date, 'Mon YYYY') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE status = 'approved'
        AND transaction_date >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(transaction_date, 'Mon YYYY'), DATE_TRUNC('month', transaction_date)
      ORDER BY DATE_TRUNC('month', transaction_date)
    `);

    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error('[Dashboard Monthly] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly data: ' + error.message },
      { status: 500 }
    );
  }
}
