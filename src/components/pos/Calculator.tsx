'use client';

import { useState, useEffect } from 'react';

interface CalculatorProps {
  totalAmount?: number;
  onChangeCalculated?: (change: number) => void;
  onCompleteSale?: () => void;
  isDisabled?: boolean;
}

export function Calculator({ totalAmount = 0, onChangeCalculated, onCompleteSale, isDisabled = false }: CalculatorProps) {
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
    <div className="bg-gray-800 rounded-lg shadow-lg p-3 max-w-sm mx-auto h-full flex flex-col border border-gray-700">
      
      <div className="mb-3 flex-shrink-0">
        <div className="bg-gray-900 text-green-400 text-right text-xl p-3 rounded font-mono min-h-[50px] flex items-center justify-end border border-gray-600">
          {display}
        </div>
        
        {/* Payment Info - Fixed height area */}
        <div className="mt-2 h-10 flex flex-col justify-center space-y-1 text-xs">
          {totalAmount > 0 && cashReceived !== null && (
            <div className="flex justify-between text-gray-300">
              <span>Cash:</span>
              <span>${cashReceived.toFixed(2)}</span>
            </div>
          )}
          {totalAmount > 0 && change !== null && (
            <div className={`flex justify-between font-semibold ${
              change >= 0 ? 'text-green-400' : 'text-red-400'
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
          onClick={isDisabled ? undefined : clear}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-sm col-span-2 flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Clear
        </button>
        <button
          onClick={isDisabled ? undefined : backspace}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-sm flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
        >
          ⌫
        </button>

        {/* Row 2 */}
        <button
          onClick={isDisabled ? undefined : () => inputNumber('1')}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          1
        </button>
        <button
          onClick={isDisabled ? undefined : () => inputNumber('2')}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          2
        </button>
        <button
          onClick={isDisabled ? undefined : () => inputNumber('3')}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          3
        </button>

        {/* Row 3 */}
        <button
          onClick={isDisabled ? undefined : () => inputNumber('4')}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          4
        </button>
        <button
          onClick={isDisabled ? undefined : () => inputNumber('5')}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          5
        </button>
        <button
          onClick={isDisabled ? undefined : () => inputNumber('6')}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          6
        </button>

        {/* Row 4 */}
        <button
          onClick={isDisabled ? undefined : () => inputNumber('7')}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          7
        </button>
        <button
          onClick={isDisabled ? undefined : () => inputNumber('8')}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          8
        </button>
        <button
          onClick={isDisabled ? undefined : () => inputNumber('9')}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          9
        </button>

        {/* Row 5 */}
        <button
          onClick={isDisabled ? undefined : () => inputNumber('0')}
          disabled={isDisabled}
          className={`col-span-2 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          0
        </button>
        <button
          onClick={isDisabled ? undefined : inputDecimal}
          disabled={isDisabled}
          className={`rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          .
        </button>
        
        {/* Row 6 */}
        <button
          onClick={isDisabled ? undefined : () => onCompleteSale?.()}
          disabled={isDisabled}
          className={`col-span-3 rounded-lg font-semibold transition-colors text-lg flex items-center justify-center ${
            isDisabled 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isDisabled ? 'History View' : 'Enter'}
        </button>
      </div>
    </div>
  );
}