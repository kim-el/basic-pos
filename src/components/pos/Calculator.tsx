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
    <div className="bg-white rounded-lg shadow-lg p-3 max-w-sm mx-auto h-full flex flex-col">
      
      <div className="mb-3 flex-shrink-0">
        <div className="bg-gray-900 text-white text-right text-xl p-3 rounded font-mono min-h-[50px] flex items-center justify-end">
          {display}
        </div>
        
        {/* Payment Info - Fixed height area */}
        <div className="mt-2 h-10 flex flex-col justify-center space-y-1 text-xs">
          {totalAmount > 0 && cashReceived !== null && (
            <div className="flex justify-between text-gray-600">
              <span>Cash:</span>
              <span>${cashReceived.toFixed(2)}</span>
            </div>
          )}
          {totalAmount > 0 && change !== null && (
            <div className={`flex justify-between font-semibold ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>Change:</span>
              <span>${change.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1 flex-1 grid-rows-6">
        {/* Row 1 - Control buttons */}
        <button
          onClick={clear}
          className="bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors text-sm col-span-2 flex items-center justify-center"
        >
          Clear
        </button>
        <button
          onClick={backspace}
          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors text-sm flex items-center justify-center"
        >
          ⌫
        </button>

        {/* Row 2 */}
        <button
          onClick={() => inputNumber('1')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          1
        </button>
        <button
          onClick={() => inputNumber('2')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          2
        </button>
        <button
          onClick={() => inputNumber('3')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          3
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputNumber('4')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          4
        </button>
        <button
          onClick={() => inputNumber('5')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          5
        </button>
        <button
          onClick={() => inputNumber('6')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          6
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputNumber('7')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          7
        </button>
        <button
          onClick={() => inputNumber('8')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          8
        </button>
        <button
          onClick={() => inputNumber('9')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          9
        </button>

        {/* Row 5 */}
        <button
          onClick={() => inputNumber('0')}
          className="col-span-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          .
        </button>
        
        {/* Row 6 */}
        <button
          onClick={() => {}}
          className="col-span-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors text-lg flex items-center justify-center"
        >
          Enter
        </button>
      </div>
    </div>
  );
}