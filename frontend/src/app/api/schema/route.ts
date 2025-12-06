import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/schema - Debug endpoint to check database schema
export async function GET(req: NextRequest) {
  try {
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const schema: any = {};

    // Get columns for each table
    for (const row of tables.rows) {
      const tableName = row.table_name;
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      schema[tableName] = columns.rows;
    }

    return NextResponse.json({ data: schema });
  } catch (error: any) {
    console.error('[Schema] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schema: ' + error.message },
      { status: 500 }
    );
  }
}
