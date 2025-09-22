import { forwardRef } from 'react';
import { BalanceSheet } from '@shared/schema';
import { format } from 'date-fns';

interface BalanceSheetPrintProps {
  balanceSheet: BalanceSheet;
  currentFY: string;
}

const BalanceSheetPrint = forwardRef<HTMLDivElement, BalanceSheetPrintProps>(
  ({ balanceSheet, currentFY }, ref) => {
    const totalAssets = parseFloat(balanceSheet.totalAssets as string) || 0;
    const totalLiabilities = parseFloat(balanceSheet.totalLiabilities as string) || 0;
    const netWorth = totalAssets - totalLiabilities;
    const getFinancialHealthStatus = () => {
      if (netWorth > 0) return { status: 'Healthy', color: 'text-green-600', bg: 'bg-green-50' };
      if (netWorth === 0) return { status: 'Balanced', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      return { status: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const healthStatus = getFinancialHealthStatus();

    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-screen">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase">Mandi360pro</h1>
          <h2 className="text-lg font-semibold mt-2">BALANCE SHEET</h2>
          <p className="text-sm mt-1">Financial Year: {currentFY}</p>
        </div>

        {/* Balance Sheet Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-4 border-b border-gray-400">Report Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Report ID:</span>
                <span>{balanceSheet.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">From Date:</span>
                <span>{format(new Date(balanceSheet.fromDate), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">To Date:</span>
                <span>{format(new Date(balanceSheet.toDate), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Period:</span>
                <span>{Math.ceil((new Date(balanceSheet.toDate).getTime() - new Date(balanceSheet.fromDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 border-b border-gray-400">Financial Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-2xl font-bold">
                <span>Net Worth:</span>
                <span className={healthStatus.color}>
                  ₹{netWorth.toLocaleString('en-IN')}
                </span>
              </div>
              <div className={`text-sm p-2 rounded ${healthStatus.bg}`}>
                <p className="font-medium">Status:</p>
                <p className={`font-semibold ${healthStatus.color}`}>
                  {healthStatus.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Sheet Summary */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Assets */}
          <div className="border border-gray-400 p-6">
            <h3 className="text-xl font-bold text-center mb-4 border-b border-gray-400 pb-2">
              ASSETS
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  ₹{totalAssets.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-600">Total Assets</p>
              </div>
              
              {/* Assets breakdown (placeholder - in real app this would come from detailed records) */}
              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span>Current Assets:</span>
                  <span>₹{(totalAssets * 0.7).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fixed Assets:</span>
                  <span>₹{(totalAssets * 0.3).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Liabilities */}
          <div className="border border-gray-400 p-6">
            <h3 className="text-xl font-bold text-center mb-4 border-b border-gray-400 pb-2">
              LIABILITIES
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  ₹{totalLiabilities.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-600">Total Liabilities</p>
              </div>
              
              {/* Liabilities breakdown (placeholder - in real app this would come from detailed records) */}
              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span>Current Liabilities:</span>
                  <span>₹{(totalLiabilities * 0.6).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Long-term Liabilities:</span>
                  <span>₹{(totalLiabilities * 0.4).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Ratios */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4 border-b border-gray-400">Key Financial Ratios</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 border border-gray-300 rounded">
              <p className="text-sm text-gray-600">Asset to Liability Ratio</p>
              <p className="text-xl font-bold">
                {totalLiabilities > 0 
                  ? (totalAssets / totalLiabilities).toFixed(2)
                  : '∞'
                }:1
              </p>
            </div>
            <div className="text-center p-4 border border-gray-300 rounded">
              <p className="text-sm text-gray-600">Equity Percentage</p>
              <p className="text-xl font-bold">
                {totalAssets > 0 
                  ? ((netWorth / totalAssets) * 100).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
            <div className="text-center p-4 border border-gray-300 rounded">
              <p className="text-sm text-gray-600">Financial Leverage</p>
              <p className="text-xl font-bold">
                {totalAssets > 0 
                  ? ((totalLiabilities / totalAssets) * 100).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
          </div>
        </div>

        {/* Summary Statement */}
        <div className="border-2 border-gray-400 p-6 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">BALANCE SHEET EQUATION</h3>
            <div className="text-lg space-y-2">
              <div className="flex justify-center items-center gap-4">
                <span className="text-green-600 font-bold">
                  Assets: ₹{totalAssets.toLocaleString('en-IN')}
                </span>
                <span className="font-bold">=</span>
                <span className="text-red-600 font-bold">
                  Liabilities: ₹{totalLiabilities.toLocaleString('en-IN')}
                </span>
                <span className="font-bold">+</span>
                <span className={`font-bold ${healthStatus.color}`}>
                  Equity: ₹{netWorth.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-3 border-b border-gray-400">Notes</h3>
          <div className="bg-gray-50 p-4 rounded border text-sm">
            <p className="mb-2">• This balance sheet represents the financial position for the period from {format(new Date(balanceSheet.fromDate), 'dd/MM/yyyy')} to {format(new Date(balanceSheet.toDate), 'dd/MM/yyyy')}</p>
            <p className="mb-2">• All amounts are in Indian Rupees (INR)</p>
            <p className="mb-2">• Asset to Liability ratio indicates financial stability</p>
            <p>• {healthStatus.status === 'Healthy' ? 'Positive net worth indicates good financial health' : 
                 healthStatus.status === 'Balanced' ? 'Balanced position - monitor cash flow carefully' :
                 'Negative net worth requires immediate attention to improve financial position'}</p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-16 grid grid-cols-2 gap-16">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm font-medium">Prepared By</p>
              <p className="text-xs text-gray-600 mt-1">Financial Controller</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm font-medium">Approved By</p>
              <p className="text-xs text-gray-600 mt-1">Date: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-400 text-center text-sm text-gray-600">
          <p>This is a computer-generated balance sheet from Mandi360pro</p>
          <p>Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
        </div>
      </div>
    );
  }
);

BalanceSheetPrint.displayName = 'BalanceSheetPrint';

export default BalanceSheetPrint;