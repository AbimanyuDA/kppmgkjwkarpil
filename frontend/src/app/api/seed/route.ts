import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST /api/seed - Insert sample data into database
export async function POST(req: NextRequest) {
  try {
    // Insert sample funds
    await pool.query(`
      INSERT INTO funds (name, description, balance) VALUES
      ('Kas Umum', 'Dana operasional gereja', 5000000),
      ('Kas Ibadah', 'Dana untuk keperluan ibadah', 3000000),
      ('Kas Sosial', 'Dana untuk kegiatan sosial', 2000000)
      ON CONFLICT (name) DO NOTHING
    `);

    // Insert sample categories
    await pool.query(`
      INSERT INTO categories (name, type, description) VALUES
      ('Persembahan', 'income', 'Persembahan jemaat'),
      ('Perpuluhan', 'income', 'Perpuluhan jemaat'),
      ('Donasi', 'income', 'Donasi dari pihak eksternal'),
      ('Gaji Pelayan', 'expense', 'Gaji untuk pelayan gereja'),
      ('Listrik & Air', 'expense', 'Biaya utilitas'),
      ('Pemeliharaan', 'expense', 'Biaya pemeliharaan gedung'),
      ('Kegiatan Ibadah', 'expense', 'Biaya kegiatan ibadah'),
      ('Kegiatan Sosial', 'expense', 'Biaya kegiatan sosial')
      ON CONFLICT (name) DO NOTHING
    `);

    // Get user id
    const userResult = await pool.query(`SELECT id FROM users WHERE email = 'testadmin@gkjw.com' LIMIT 1`);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    // Get fund and category IDs
    const kasUmum = await pool.query(`SELECT id FROM funds WHERE name = 'Kas Umum' LIMIT 1`);
    const kasIbadah = await pool.query(`SELECT id FROM funds WHERE name = 'Kas Ibadah' LIMIT 1`);
    const catPersembahan = await pool.query(`SELECT id FROM categories WHERE name = 'Persembahan' LIMIT 1`);
    const catListrik = await pool.query(`SELECT id FROM categories WHERE name = 'Listrik & Air' LIMIT 1`);
    const catIbadah = await pool.query(`SELECT id FROM categories WHERE name = 'Kegiatan Ibadah' LIMIT 1`);

    // Insert sample transactions
    const transactions = [
      {
        date: `CURRENT_DATE - INTERVAL '7 days'`,
        fund_id: kasUmum.rows[0].id,
        category_id: catPersembahan.rows[0].id,
        amount: 1500000,
        description: 'Persembahan Minggu I',
        type: 'income',
        status: 'approved'
      },
      {
        date: `CURRENT_DATE - INTERVAL '5 days'`,
        fund_id: kasUmum.rows[0].id,
        category_id: catListrik.rows[0].id,
        amount: 500000,
        description: 'Pembayaran listrik dan air bulan ini',
        type: 'expense',
        status: 'approved'
      },
      {
        date: `CURRENT_DATE - INTERVAL '3 days'`,
        fund_id: kasIbadah.rows[0].id,
        category_id: catIbadah.rows[0].id,
        amount: 300000,
        description: 'Pembelian alat musik',
        type: 'expense',
        status: 'pending'
      }
    ];

    for (const tx of transactions) {
      await pool.query(`
        INSERT INTO transactions (transaction_date, fund_id, category_id, amount, description, type, status, created_by)
        VALUES (${tx.date}, $1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [tx.fund_id, tx.category_id, tx.amount, tx.description, tx.type, tx.status, userId]);
    }

    return NextResponse.json({ 
      message: 'Sample data inserted successfully',
      data: {
        funds: 3,
        categories: 8,
        transactions: 3
      }
    });
  } catch (error: any) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { error: 'Failed to seed data: ' + error.message },
      { status: 500 }
    );
  }
}
