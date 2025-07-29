'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CartItem } from '@/types/pos';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center text-base sm:text-lg">
          Shopping Cart
          <Badge variant="secondary" className="text-xs">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col px-3 sm:px-6">
        <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-6 sm:py-8 text-sm">
              Your cart is empty
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="border rounded-lg p-2 sm:p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate">{item.product.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">${item.product.price.toFixed(2)} each</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-red-500 hover:text-red-700 ml-2 p-1 h-auto touch-manipulation"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 p-0 touch-manipulation"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 sm:w-10 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="h-8 w-8 p-0 touch-manipulation"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-semibold text-sm sm:text-base">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {items.length > 0 && (
          <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base sm:text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full mt-3 sm:mt-4 h-12 sm:h-auto text-base font-semibold touch-manipulation" 
              size="lg"
              onClick={onCheckout}
            >
              Checkout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}