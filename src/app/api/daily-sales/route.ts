import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        COALESCE(ds.total_sales, 0) as total_sales,
        COALESCE(ds.total_transactions, 0) as total_transactions,
        ds.sale_date
      FROM daily_sales ds
      WHERE ds.sale_date = CURRENT_DATE
      UNION ALL
      SELECT 
        COALESCE(SUM(t.total_amount), 0) as total_sales,
        COALESCE(COUNT(t.id), 0) as total_transactions,
        CURRENT_DATE as sale_date
      FROM transactions t
      WHERE DATE(t.created_at) = CURRENT_DATE
      AND NOT EXISTS (SELECT 1 FROM daily_sales WHERE sale_date = CURRENT_DATE)
      LIMIT 1
    `);
    
    const todaySales = result.rows[0] || {
      total_sales: 0,
      total_transactions: 0,
      sale_date: new Date().toISOString().split('T')[0]
    };
    
    return NextResponse.json(todaySales);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily sales' },
      { status: 500 }
    );
  }
}