import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// PUT /api/users/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();

    // Check if email already exists for other users
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, params.id]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    let query = `UPDATE users SET name = $1, email = $2, role = $3, updated_at = NOW()`;
    let values: any[] = [name, email, role];

    // Update password if provided
    if (password) {
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(password, 10);
      query += `, password_hash = $4`;
      values.push(password_hash);
      query += ` WHERE id = $5 RETURNING id, name, email, role, created_at, updated_at`;
      values.push(params.id);
    } else {
      query += ` WHERE id = $4 RETURNING id, name, email, role, created_at, updated_at`;
      values.push(params.id);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error: any) {
    console.error('[User PUT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow deleting yourself
    if (user.id === parseInt(params.id)) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [params.id]);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error: any) {
    console.error('[User DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user: ' + error.message },
      { status: 500 }
    );
  }
}
