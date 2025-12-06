import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/transactions
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(`
      SELECT 
        t.id, t.date, t.amount, t.description, t.type, t.status,
        t.category, t.event_name, t.payment_method,
        t.created_by, t.created_at, t.updated_at,
        f.name as fund_name, u.name as creator_name
      FROM transactions t
      LEFT JOIN funds f ON t.fund_id = f.id
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.date DESC, t.created_at DESC
    `);

    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error('[Transactions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, fund_id, category, amount, description, type, event_name, payment_method } = await req.json();

    if (!date || !fund_id || !amount || !type || !event_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO transactions 
       (date, fund_id, category, amount, description, type, event_name, payment_method, status, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [date, fund_id, category || '', amount, description || '', type, event_name, payment_method || 'cash', 'pending', user.id]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[Transactions POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction: ' + error.message },
      { status: 500 }
    );
  }
}
