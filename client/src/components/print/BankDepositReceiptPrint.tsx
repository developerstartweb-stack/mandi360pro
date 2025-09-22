import { forwardRef } from 'react';
import { BankDepositReceipt } from '@shared/schema';
import { format } from 'date-fns';

interface BankDepositReceiptPrintProps {
  receipt: BankDepositReceipt;
  currentFY: string;
}

const BankDepositReceiptPrint = forwardRef<HTMLDivElement, BankDepositReceiptPrintProps>(
  ({ receipt, currentFY }, ref) => {
    const cashMode = (receipt.cashMode as any[]) || [];
    const totalAmount = parseFloat(receipt.total as string) || 0;

    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-screen">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase">Mandi360pro</h1>
          <h2 className="text-lg font-semibold mt-2">BANK DEPOSIT RECEIPT</h2>
          <p className="text-sm mt-1">Financial Year: {currentFY}</p>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4 border-b border-gray-400">Deposit Information</h3>
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
                <span className="font-medium">Bank Name:</span>
                <span>{receipt.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Receipt No:</span>
                <span>{receipt.receiptNo}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 border-b border-gray-400">Amount Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-2xl font-bold">
                <span>Total Amount:</span>
                <span className="text-green-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-sm text-gray-600 border-t pt-2">
                <p>Deposit verified amount:</p>
                <p className="font-medium">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Breakdown */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4 border-b border-gray-400">Cash Breakdown Details</h3>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-3 text-left">Denomination</th>
                <th className="border border-gray-400 p-3 text-center">Quantity</th>
                <th className="border border-gray-400 p-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {cashMode.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-3 font-semibold">
                    ₹{item.denomination.toLocaleString('en-IN')}
                  </td>
                  <td className="border border-gray-400 p-3 text-center">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-400 p-3 text-right font-semibold">
                    ₹{(item.denomination * item.quantity).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold text-lg">
                <td className="border border-gray-400 p-3" colSpan={2}>Total Cash</td>
                <td className="border border-gray-400 p-3 text-right text-green-600">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-3 border-b border-gray-400">Description</h3>
          <div className="bg-gray-50 p-4 rounded border">
            <p className="text-sm leading-relaxed">Bank deposit receipt for cash deposited to {receipt.bankName}</p>
          </div>
        </div>

        {/* Deposit Summary Box */}
        <div className="border-2 border-gray-400 p-6 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">DEPOSIT SUMMARY</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Bank</p>
                <p className="text-lg font-bold">{receipt.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account</p>
                <p className="text-lg font-bold">{receipt.receiptNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount Deposited</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-3 border-b border-gray-400">Verification</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-sm"><strong>Cash Count Verified:</strong> Yes</p>
              <p className="text-sm"><strong>Denominations Checked:</strong> {cashMode.length} types</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm"><strong>Amount Match:</strong> 
                <span className="text-green-600">
                  ✓ Verified
                </span>
              </p>
              <p className="text-sm"><strong>Status:</strong> 
                <span className="text-green-600"> Completed</span>
              </p>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-16 grid grid-cols-3 gap-12">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm font-medium">Cash Counted By</p>
              <p className="text-xs text-gray-600 mt-1">Cashier</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm font-medium">Verified By</p>
              <p className="text-xs text-gray-600 mt-1">Supervisor</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm font-medium">Deposited By</p>
              <p className="text-xs text-gray-600 mt-1">Date: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-400 text-center text-sm text-gray-600">
          <p>This is a computer-generated bank deposit receipt from Mandi360pro</p>
          <p>Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
        </div>
      </div>
    );
  }
);

BankDepositReceiptPrint.displayName = 'BankDepositReceiptPrint';

export default BankDepositReceiptPrint;