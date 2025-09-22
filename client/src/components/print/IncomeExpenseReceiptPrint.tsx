import { forwardRef } from 'react';
import { IncomeExpenseReceipt } from '@shared/schema';
import { format } from 'date-fns';

interface IncomeExpenseReceiptPrintProps {
  receipt: IncomeExpenseReceipt;
  currentFY: string;
}

const IncomeExpenseReceiptPrint = forwardRef<HTMLDivElement, IncomeExpenseReceiptPrintProps>(
  ({ receipt, currentFY }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-screen">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase">Mandi360pro</h1>
          <h2 className="text-lg font-semibold mt-2">
            {receipt.type === 'income' ? 'INCOME' : 'EXPENSE'} RECEIPT
          </h2>
          <p className="text-sm mt-1">Financial Year: {currentFY}</p>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4 border-b border-gray-400">Receipt Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Receipt ID:</span>
                <span>{receipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{format(new Date(receipt.receiptDate), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span className={`font-semibold uppercase ${
                  receipt.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {receipt.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Mode:</span>
                <span className="uppercase">{receipt.paymentMode}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 border-b border-gray-400">Amount Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-2xl font-bold">
                <span>Amount:</span>
                <span className={receipt.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                  ₹{parseFloat(receipt.amount as string).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-sm text-gray-600 border-t pt-2">
                <p>Amount in words:</p>
                <p className="font-medium italic">
                  {/* This would need a number-to-words conversion utility */}
                  Rupees {parseFloat(receipt.amount as string).toLocaleString('en-IN')} Only
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-3 border-b border-gray-400">Description</h3>
          <div className="bg-gray-50 p-4 rounded border">
            <p className="text-sm leading-relaxed">{receipt.name}</p>
          </div>
        </div>

        {/* Receipt Summary Box */}
        <div className="border-2 border-gray-400 p-6 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">RECEIPT SUMMARY</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-600">Transaction Type</p>
                <p className={`text-lg font-bold uppercase ${
                  receipt.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {receipt.type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className={`text-2xl font-bold ${
                  receipt.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{parseFloat(receipt.amount as string).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-16 grid grid-cols-2 gap-16">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm font-medium">Prepared By</p>
              <p className="text-xs text-gray-600 mt-1">Mandi360pro System</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm font-medium">Authorized Signature</p>
              <p className="text-xs text-gray-600 mt-1">Date: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-400 text-center text-sm text-gray-600">
          <p>This is a computer-generated receipt from Mandi360pro</p>
          <p>Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
        </div>
      </div>
    );
  }
);

IncomeExpenseReceiptPrint.displayName = 'IncomeExpenseReceiptPrint';

export default IncomeExpenseReceiptPrint;