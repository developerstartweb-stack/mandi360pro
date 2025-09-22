import { forwardRef } from 'react';
import { Rojmel } from '@shared/schema';
import { format } from 'date-fns';

interface RojmelPrintProps {
  rojmel: Rojmel;
  currentFY: string;
}

const RojmelPrint = forwardRef<HTMLDivElement, RojmelPrintProps>(
  ({ rojmel, currentFY }, ref) => {
    const incomeRecords = (rojmel.incomeRecords as any[]) || [];
    const expenseRecords = (rojmel.expenseRecords as any[]) || [];
    const totalIncome = parseFloat(rojmel.totalIncome as string) || 0;
    const totalExpense = parseFloat(rojmel.totalExpense as string) || 0;
    const netAmount = parseFloat(rojmel.net as string) || 0;

    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-screen">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase">Mandi360pro</h1>
          <h2 className="text-lg font-semibold mt-2">ROJMEL REPORT</h2>
          <p className="text-sm mt-1">Financial Year: {currentFY}</p>
        </div>

        {/* Rojmel Details */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b border-gray-400">Basic Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Rojmel ID:</span>
                <span>{rojmel.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{format(new Date(rojmel.rojmelDate), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Rojmel ID:</span>
                <span>{rojmel.rojmelId}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b border-gray-400">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Total Income:</span>
                <span className="text-green-600 font-semibold">₹{totalIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Expense:</span>
                <span className="text-red-600 font-semibold">₹{totalExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Net Amount:</span>
                <span className={netAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₹{netAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Income Records */}
        {incomeRecords.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-3 border-b border-gray-400">Income Records</h3>
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left">Description</th>
                  <th className="border border-gray-400 p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {incomeRecords.map((record: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2">{record.description}</td>
                    <td className="border border-gray-400 p-2 text-right font-semibold">
                      {record.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border border-gray-400 p-2">Total Income</td>
                  <td className="border border-gray-400 p-2 text-right text-green-600">
                    ₹{totalIncome.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Expense Records */}
        {expenseRecords.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-3 border-b border-gray-400">Expense Records</h3>
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left">Description</th>
                  <th className="border border-gray-400 p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {expenseRecords.map((record: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2">{record.description}</td>
                    <td className="border border-gray-400 p-2 text-right font-semibold">
                      {record.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border border-gray-400 p-2">Total Expense</td>
                  <td className="border border-gray-400 p-2 text-right text-red-600">
                    ₹{totalExpense.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-400 text-center text-sm text-gray-600">
          <p>This is a computer-generated document from Mandi360pro</p>
          <p>Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
        </div>
      </div>
    );
  }
);

RojmelPrint.displayName = 'RojmelPrint';

export default RojmelPrint;