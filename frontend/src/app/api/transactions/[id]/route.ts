import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// PUT /api/transactions/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { date, fund_id, category, amount, description, type, event_name, payment_method } = body;

    const result = await pool.query(
      `UPDATE transactions 
       SET date = $1, fund_id = $2, category = $3, 
           amount = $4, description = $5, type = $6, event_name = $7, payment_method = $8, updated_at = NOW()
       WHERE id = $9 
       RETURNING *`,
      [date, fund_id, category, amount, description, type, event_name, payment_method, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error: any) {
    console.error('[Transaction PUT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await pool.query('DELETE FROM transactions WHERE id = $1', [params.id]);
    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error: any) {
    console.error('[Transaction DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction: ' + error.message },
      { status: 500 }
    );
  }
}
