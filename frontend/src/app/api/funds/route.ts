import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/funds
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(`
      SELECT id, name, description, balance, created_at, updated_at
      FROM funds
      ORDER BY name
    `);

    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error('[Funds GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funds: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/funds
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, balance } = await req.json();

    const result = await pool.query(
      `INSERT INTO funds (name, description, balance) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description || '', balance || 0]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[Funds POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create fund: ' + error.message },
      { status: 500 }
    );
  }
}
