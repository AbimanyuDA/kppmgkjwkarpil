import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST /api/setup - Setup database tables
export async function POST(req: NextRequest) {
  try {
    // Create funds table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS funds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL DEFAULT 'general',
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(type, name)
      )
    `);

    // Check if transactions table exists and has the old schema
    const transCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' AND column_name IN ('date', 'category', 'fund_id')
    `);

    const hasDateColumn = transCheck.rows.some((r: any) => r.column_name === 'date');
    const hasCategoryColumn = transCheck.rows.some((r: any) => r.column_name === 'category');
    const hasFundIdColumn = transCheck.rows.some((r: any) => r.column_name === 'fund_id');

    return NextResponse.json({
      message: 'Database setup completed',
      data: {
        fundsTableCreated: true,
        categoriesTableCreated: true,
        transactionsSchema: {
          hasDateColumn,
          hasCategoryColumn,
          hasFundIdColumn
        }
      }
    });
  } catch (error: any) {
    console.error('[Setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to setup database: ' + error.message },
      { status: 500 }
    );
  }
}
