import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/reports
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const fundId = searchParams.get('fundId');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');

    let query = `
      SELECT 
        t.id, t.transaction_date, t.amount, t.description, t.type, t.status,
        f.name as fund_name, c.name as category_name, u.name as creator_name
      FROM transactions t
      LEFT JOIN funds f ON t.fund_id = f.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.status = 'approved'
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND t.transaction_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND t.transaction_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    if (fundId) {
      query += ` AND t.fund_id = $${paramCount}`;
      params.push(fundId);
      paramCount++;
    }

    if (categoryId) {
      query += ` AND t.category_id = $${paramCount}`;
      params.push(categoryId);
      paramCount++;
    }

    if (type) {
      query += ` AND t.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    query += ` ORDER BY t.transaction_date DESC`;

    const result = await pool.query(query, params);

    // Calculate summary
    const income = result.rows
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expense = result.rows
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return NextResponse.json({
      data: {
        transactions: result.rows,
        summary: {
          income,
          expense,
          balance: income - expense,
        },
      },
    });
  } catch (error: any) {
    console.error('[Reports GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report: ' + error.message },
      { status: 500 }
    );
  }
}
