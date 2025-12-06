import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/dashboard/category
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get expense by category for the current month
    const result = await pool.query(`
      SELECT 
        t.category,
        SUM(t.amount) as total
      FROM transactions t
      WHERE t.status = 'approved'
        AND t.type = 'expense'
        AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY t.category
      ORDER BY total DESC
      LIMIT 10
    `);

    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error('[Dashboard Category] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category data: ' + error.message },
      { status: 500 }
    );
  }
}
