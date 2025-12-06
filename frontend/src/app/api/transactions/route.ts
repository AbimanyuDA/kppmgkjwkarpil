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
        t.id, t.transaction_date, t.amount, t.description, t.type, t.status,
        t.created_by, t.approved_by, t.created_at, t.updated_at,
        f.name as fund_name, c.name as category_name,
        u.name as creator_name
      FROM transactions t
      LEFT JOIN funds f ON t.fund_id = f.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.transaction_date DESC, t.created_at DESC
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

    const { transaction_date, fund_id, category_id, amount, description, type } = await req.json();

    if (!transaction_date || !fund_id || !amount || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO transactions 
       (transaction_date, fund_id, category_id, amount, description, type, status, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [transaction_date, fund_id, category_id || null, amount, description || '', type, 'pending', user.id]
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
