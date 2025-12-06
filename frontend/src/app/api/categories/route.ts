import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/categories
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(`
      SELECT id, name, type, description, created_at, updated_at
      FROM categories
      ORDER BY type, name
    `);

    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error('[Categories GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, type, description } = await req.json();

    const result = await pool.query(
      `INSERT INTO categories (name, type, description) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, type, description || '']
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[Categories POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create category: ' + error.message },
      { status: 500 }
    );
  }
}
