'use client';

import { useState, useEffect } from 'react';

interface CalculatorProps {
  totalAmount?: number;
  onChangeCalculated?: (change: number) => void;
}

export function Calculator({ totalAmount = 0, onChangeCalculated }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [cashReceived, setCashReceived] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);

  // When total amount changes, update display
  useEffect(() => {
    if (totalAmount > 0) {
      setDisplay(totalAmount.toFixed(2));
      setCashReceived(null);
      setChange(null);
    } else {
      setDisplay('0');
      setCashReceived(null);
      setChange(null);
    }
  }, [totalAmount]);

  const inputNumber = (num: string) => {
    // POS cash input - always entering cash received
    if (cashReceived === null) {
      const newCash = num === '0' ? 0 : parseFloat(num);
      setCashReceived(newCash);
      setDisplay(newCash.toString());
      calculateChange(newCash, totalAmount);
    } else {
      const newCash = parseFloat(cashReceived.toString() + num);
      setCashReceived(newCash);
      setDisplay(newCash.toString());
      calculateChange(newCash, totalAmount);
    }
  };

  const calculateChange = (cash: number, total: number) => {
    const changeAmount = cash - total;
    setChange(changeAmount);
    if (onChangeCalculated) {
      onChangeCalculated(changeAmount);
    }
  };


  const clear = () => {
    // POS clear - go back to total amount
    setDisplay(totalAmount > 0 ? totalAmount.toFixed(2) : '0');
    setCashReceived(null);
    setChange(null);
  };


  const backspace = () => {
    if (cashReceived !== null) {
      const currentStr = display.toString();
      if (currentStr.length > 1) {
        const newStr = currentStr.slice(0, -1);
        const newCash = parseFloat(newStr) || 0;
        setCashReceived(newCash);
        setDisplay(newStr);
        calculateChange(newCash, totalAmount);
      } else {
        // If only one digit left, reset to total
        setDisplay(totalAmount.toFixed(2));
        setCashReceived(null);
        setChange(null);
      }
    }
  };

  const inputDecimal = () => {
    if (cashReceived === null) {
      setCashReceived(0);
      setDisplay('0.');
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto">
      {/* POS Header */}
      <div className="mb-2 text-center">
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-800">
          Cash Register
        </span>
      </div>
      
      <div className="mb-4">
        <div className="bg-gray-900 text-white text-right text-2xl p-4 rounded font-mono min-h-[60px] flex items-center justify-end">
          {display}
        </div>
        
        {/* Payment Info */}
        {totalAmount > 0 && (
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            {cashReceived !== null && (
              <div className="flex justify-between text-gray-600">
                <span>Cash:</span>
                <span>${cashReceived.toFixed(2)}</span>
              </div>
            )}
            {change !== null && (
              <div className={`flex justify-between font-semibold ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>Change:</span>
                <span>${change.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Row 1 - Control buttons */}
        <button
          onClick={clear}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg font-semibold transition-colors text-lg"
        >
          Clear
        </button>
        <button
          onClick={backspace}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg font-semibold transition-colors text-lg"
        >
          ⌫
        </button>
        <button
          onClick={() => {}}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg font-semibold transition-colors text-lg"
        >
          ✓
        </button>

        {/* Row 2 */}
        <button
          onClick={() => inputNumber('7')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          7
        </button>
        <button
          onClick={() => inputNumber('8')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          8
        </button>
        <button
          onClick={() => inputNumber('9')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          9
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputNumber('4')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          4
        </button>
        <button
          onClick={() => inputNumber('5')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          5
        </button>
        <button
          onClick={() => inputNumber('6')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          6
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputNumber('1')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          1
        </button>
        <button
          onClick={() => inputNumber('2')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          2
        </button>
        <button
          onClick={() => inputNumber('3')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          3
        </button>

        {/* Row 5 */}
        <button
          onClick={() => inputNumber('0')}
          className="col-span-2 bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-4 rounded-lg font-semibold transition-colors text-xl"
        >
          .
        </button>
      </div>
    </div>
  );
}