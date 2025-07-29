import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT id, name, description, price, category, image_url, stock_quantity, is_active
      FROM products 
      WHERE is_active = true
      ORDER BY category, name
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, category, stock_quantity } = await request.json();
    
    const result = await query(
      `INSERT INTO products (name, description, price, category, stock_quantity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, price, category, stock_quantity]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}