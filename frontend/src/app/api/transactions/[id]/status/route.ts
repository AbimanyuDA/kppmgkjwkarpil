import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// PUT /api/transactions/[id]/status
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status, rejection_reason } = await req.json();

    const result = await pool.query(
      `UPDATE transactions 
       SET status = $1, approved_by = $2, rejection_reason = $3, updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [status, user.id, rejection_reason || null, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error: any) {
    console.error('[Transaction Status PUT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction status: ' + error.message },
      { status: 500 }
    );
  }
}
