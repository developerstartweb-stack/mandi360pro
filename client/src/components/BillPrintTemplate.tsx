import { forwardRef } from "react";
import { format } from "date-fns";
import type { CustomerBilling, KhataBilling } from "@shared/schema";

interface BillPrintTemplateProps {
  billData: CustomerBilling | KhataBilling;
  companyProfile?: {
    companyName: string;
    address?: string;
    phone1?: string;
    phone2?: string;
    gst?: string;
    licenseNo?: string;
    email?: string;
    logoUrl?: string;
  };
  billType: "customer" | "khata";
}

export const BillPrintTemplate = forwardRef<HTMLDivElement, BillPrintTemplateProps>(
  ({ billData, companyProfile, billType }, ref) => {
    const isKhataBill = billType === "khata";
    const items = billData.billItems as any[] || [];

    return (
      <div ref={ref} className="bg-white p-8 print:p-0" data-testid="bill-print-template">
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print\\:hidden {
              display: none !important;
            }
            .page-break {
              page-break-after: always;
            }
          }
        `}</style>

        <div className="max-w-4xl mx-auto border-2 border-black">
          {/* Header Section */}
          <div className="border-b-2 border-black">
            <div className="flex items-start justify-between p-4">
              {/* Company Logo */}
              <div className="w-24 h-24 flex items-center justify-center">
                {companyProfile?.logoUrl ? (
                  <img 
                    src={companyProfile.logoUrl} 
                    alt="Company Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 border-2 border-gray-400 flex items-center justify-center text-gray-400 text-xs">
                    LOGO
                  </div>
                )}
              </div>

              {/* Company Details */}
              <div className="flex-1 text-center px-4">
                <h1 className="text-3xl font-bold uppercase mb-1">
                  {companyProfile?.companyName || "COMPANY NAME"}
                </h1>
                {companyProfile?.address && (
                  <p className="text-sm mb-1">{companyProfile.address}</p>
                )}
                <div className="text-sm flex justify-center gap-4 flex-wrap">
                  {companyProfile?.phone1 && (
                    <span>Ph: {companyProfile.phone1}</span>
                  )}
                  {companyProfile?.phone2 && (
                    <span>Ph: {companyProfile.phone2}</span>
                  )}
                </div>
                {companyProfile?.email && (
                  <p className="text-sm">Email: {companyProfile.email}</p>
                )}
                {(companyProfile?.gst || companyProfile?.licenseNo) && (
                  <div className="text-sm mt-1">
                    {companyProfile?.gst && <span>GST: {companyProfile.gst}</span>}
                    {companyProfile?.gst && companyProfile?.licenseNo && <span className="mx-2">|</span>}
                    {companyProfile?.licenseNo && <span>License: {companyProfile.licenseNo}</span>}
                  </div>
                )}
              </div>

              {/* Bill Type Badge */}
              <div className="w-24 flex justify-end">
                <div className="bg-gray-800 text-white px-3 py-1 text-sm font-bold rounded">
                  {isKhataBill ? "KHATA" : "CASH"}
                </div>
              </div>
            </div>

            {/* Bill Title */}
            <div className="bg-gray-800 text-white text-center py-2">
              <h2 className="text-xl font-bold uppercase">
                {isKhataBill ? "KHATA BILL / उधार बिल" : "CASH BILL / नकद बिल"}
              </h2>
            </div>
          </div>

          {/* Bill Details Section */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            {/* Left Column - Customer Details */}
            <div className="border-r-2 border-black p-4">
              <div className="mb-2">
                <span className="font-bold">Bill No / बिल नं:</span>
                <span className="ml-2">{billData.billNo}</span>
              </div>
              <div className="mb-2">
                <span className="font-bold">Date / तारीख:</span>
                <span className="ml-2">
                  {billData.billDate ? format(new Date(billData.billDate), 'dd/MM/yyyy') : ''}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-bold">Customer / ग्राहक:</span>
                <span className="ml-2 uppercase">{billData.customerName}</span>
              </div>
              {billData.accountId && (
                <div className="mb-2">
                  <span className="font-bold">Account ID:</span>
                  <span className="ml-2">{billData.accountId}</span>
                </div>
              )}
            </div>

            {/* Right Column - Additional Details */}
            <div className="p-4">
              {isKhataBill && (billData as KhataBilling).dueDate && (
                <div className="mb-2">
                  <span className="font-bold">Due Date / देय तारीख:</span>
                  <span className="ml-2">
                    {format(new Date((billData as KhataBilling).dueDate!), 'dd/MM/yyyy')}
                  </span>
                </div>
              )}
              {billData.transportName && (
                <div className="mb-2">
                  <span className="font-bold">Transport / वाहन:</span>
                  <span className="ml-2">{billData.transportName}</span>
                </div>
              )}
              {billData.vehicleNo && (
                <div className="mb-2">
                  <span className="font-bold">Vehicle No / गाड़ी नं:</span>
                  <span className="ml-2">{billData.vehicleNo}</span>
                </div>
              )}
              {isKhataBill && (billData as KhataBilling).creditLimit && (
                <div className="mb-2">
                  <span className="font-bold">Credit Limit:</span>
                  <span className="ml-2">₹{Number((billData as KhataBilling).creditLimit || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-black p-2 text-left text-sm font-bold w-12">Sr.<br/>क्रमांक</th>
                <th className="border-2 border-black p-2 text-left text-sm font-bold">Product<br/>उत्पादन</th>
                <th className="border-2 border-black p-2 text-left text-sm font-bold">Quality<br/>गुणवत्ता</th>
                <th className="border-2 border-black p-2 text-center text-sm font-bold">Qty<br/>मात्रा</th>
                <th className="border-2 border-black p-2 text-center text-sm font-bold">Weight (Kg)<br/>वजन</th>
                <th className="border-2 border-black p-2 text-right text-sm font-bold">Rate<br/>दर</th>
                <th className="border-2 border-black p-2 text-right text-sm font-bold">Amount<br/>राशि</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border-2 border-black p-2 text-center">{index + 1}</td>
                  <td className="border-2 border-black p-2">{item.productName || item.productId}</td>
                  <td className="border-2 border-black p-2">{item.quality || "-"}</td>
                  <td className="border-2 border-black p-2 text-center">{item.quantity || 0}</td>
                  <td className="border-2 border-black p-2 text-center">{Number(item.weight || 0).toFixed(2)}</td>
                  <td className="border-2 border-black p-2 text-right">₹{Number(item.rate || 0).toFixed(2)}</td>
                  <td className="border-2 border-black p-2 text-right font-bold">₹{Number(item.total || 0).toFixed(2)}</td>
                </tr>
              ))}
              
              {/* Add empty rows if needed for spacing */}
              {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, idx) => (
                <tr key={`empty-${idx}`}>
                  <td className="border-2 border-black p-2 text-center">&nbsp;</td>
                  <td className="border-2 border-black p-2">&nbsp;</td>
                  <td className="border-2 border-black p-2">&nbsp;</td>
                  <td className="border-2 border-black p-2">&nbsp;</td>
                  <td className="border-2 border-black p-2">&nbsp;</td>
                  <td className="border-2 border-black p-2">&nbsp;</td>
                  <td className="border-2 border-black p-2">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations Section */}
          <div className="grid grid-cols-2">
            {/* Left Side - Expenses Breakdown */}
            <div className="border-r-2 border-black p-4">
              <h3 className="font-bold mb-2 text-sm uppercase">Expenses / खर्चे:</h3>
              {billData.expenses && (billData.expenses as any[]).length > 0 ? (
                <div className="space-y-1 text-sm">
                  {(billData.expenses as any[]).map((expense: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{expense.name}:</span>
                      <span>₹{Number(expense.amount || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No expenses</div>
              )}
            </div>

            {/* Right Side - Totals */}
            <div className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between pb-1">
                  <span className="font-semibold">Subtotal / उप-योग:</span>
                  <span>₹{Number(billData.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="font-semibold">Total Expenses / कुल खर्चे:</span>
                  <span>₹{Number(billData.totalExpenses || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-black">
                  <span className="font-bold text-base">Grand Total / कुल राशि:</span>
                  <span className="font-bold text-base">₹{Number(billData.grandTotal || 0).toFixed(2)}</span>
                </div>
                {billData.paidAmount && Number(billData.paidAmount) > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-semibold">Paid / भुगतान:</span>
                      <span>₹{Number(billData.paidAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-black">
                      <span className="font-bold">Balance / शेष:</span>
                      <span className="font-bold">₹{(Number(billData.grandTotal || 0) - Number(billData.paidAmount || 0)).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {billData.notes && (
            <div className="border-t-2 border-black p-4">
              <span className="font-bold">Notes / टिप्पणी: </span>
              <span>{billData.notes}</span>
            </div>
          )}

          {/* Footer Section */}
          <div className="border-t-2 border-black p-4">
            <div className="flex justify-between items-end">
              <div className="text-sm">
                <p className="font-semibold">Terms & Conditions / नियम व शर्तें:</p>
                <ul className="text-xs mt-1 space-y-0.5">
                  <li>• Goods once sold will not be taken back</li>
                  <li>• Subject to jurisdiction only</li>
                  <li>• Payment should be made within credit period</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-black pt-2 px-8 mt-12">
                  <p className="text-sm font-bold">Authorized Signature</p>
                  <p className="text-xs">अधिकृत हस्ताक्षर</p>
                </div>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          <div className="text-center text-xs text-gray-500 p-2 border-t border-gray-300">
            <p>This is a computer generated bill</p>
            <p>Printed on: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
          </div>
        </div>
      </div>
    );
  }
);

BillPrintTemplate.displayName = "BillPrintTemplate";
