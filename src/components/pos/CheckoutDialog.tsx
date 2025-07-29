'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/types/pos';
import { CreditCard, Banknote, Smartphone, Check } from 'lucide-react';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onCompleteTransaction: (paymentMethod: 'cash' | 'card' | 'digital', customerName?: string) => void;
}

export function CheckoutDialog({ isOpen, onClose, items, onCompleteTransaction }: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital' | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCompletePayment = async () => {
    if (!paymentMethod) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsComplete(true);
    
    onCompleteTransaction(paymentMethod, customerName || undefined);
    
    // Auto close after showing success
    setTimeout(() => {
      setIsComplete(false);
      setPaymentMethod(null);
      setCustomerName('');
      onClose();
    }, 2000);
  };

  const paymentMethods = [
    { id: 'cash' as const, label: 'Cash', icon: Banknote },
    { id: 'card' as const, label: 'Card', icon: CreditCard },
    { id: 'digital' as const, label: 'Digital Wallet', icon: Smartphone },
  ];

  if (isComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm sm:max-w-md mx-4">
          <div className="text-center py-6 sm:py-8">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-sm sm:text-base text-gray-600">Transaction completed successfully</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Checkout</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Order Summary</h3>
            <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-xs sm:text-sm">
                  <span className="truncate mr-2">{item.product.name} x{item.quantity}</span>
                  <span className="flex-shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3 sm:my-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base sm:text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Payment Method</h3>
            <div className="space-y-2 sm:space-y-3 mb-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-colors touch-manipulation ${
                      paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <CardContent className="flex items-center p-3 sm:p-4">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      <span className="text-sm sm:text-base">{method.label}</span>
                      {paymentMethod === method.id && (
                        <Badge className="ml-auto text-xs">Selected</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mb-4">
              <label htmlFor="customerName" className="block text-xs sm:text-sm font-medium mb-2">
                Customer Name (Optional)
              </label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-sm sm:text-base h-10 sm:h-auto"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Button 
                className="w-full h-12 sm:h-auto text-sm sm:text-base font-semibold touch-manipulation" 
                onClick={handleCompletePayment}
                disabled={!paymentMethod || isProcessing}
              >
                {isProcessing ? 'Processing...' : `Process Payment - $${total.toFixed(2)}`}
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-10 sm:h-auto text-sm sm:text-base touch-manipulation" 
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}