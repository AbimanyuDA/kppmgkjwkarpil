import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('[Login] Request started');
  
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[Login] Querying database for:', email);
    // Query user from database
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    console.log('[Login] Database query took:', Date.now() - startTime, 'ms');

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data without password
    const { password_hash, ...userData } = user;

    console.log('[Login] Success, total time:', Date.now() - startTime, 'ms');
    return NextResponse.json({
      data: {
        token,
        user: {
          ...userData,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error: any) {
    console.error('[Login] Error after', Date.now() - startTime, 'ms:', error.message);
    console.error('[Login] Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
