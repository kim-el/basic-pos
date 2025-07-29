import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

export async function POST(request: Request) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const { items, total, tax, subtotal, paymentMethod, customerName } = await request.json();
    
    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions (total_amount, tax_amount, subtotal_amount, payment_method, customer_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [total, tax, subtotal, paymentMethod, customerName || null]
    );
    
    const transactionId = transactionResult.rows[0].id;
    
    // Add transaction items
    for (const item of items) {
      await client.query(
        `INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [transactionId, item.productId, item.quantity, item.price, item.quantity * item.price]
      );
      
      // Update product stock
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }
    
    await client.query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      transactionId,
      message: 'Transaction completed successfully' 
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        t.id,
        t.total_amount,
        t.tax_amount,
        t.subtotal_amount,
        t.payment_method,
        t.customer_name,
        t.created_at,
        COUNT(ti.id) as item_count
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      GROUP BY t.id, t.total_amount, t.tax_amount, t.subtotal_amount, t.payment_method, t.customer_name, t.created_at
      ORDER BY t.created_at DESC
      LIMIT 50
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}