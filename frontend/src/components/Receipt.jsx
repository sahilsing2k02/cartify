import { forwardRef, useMemo } from 'react';

const Receipt = forwardRef(({ cartItems, subtotal, vat, total, recipient, orderId, orderDate }, ref) => {
  const date = useMemo(() => orderDate || new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), [orderDate]);
  const receiptId = useMemo(() => orderId || Math.random().toString(36).substring(2, 9).toUpperCase(), [orderId]);

  return (
    <div ref={ref} className="bg-white p-6 max-w-sm mx-auto text-slate-800 border border-slate-200 shadow-sm print:shadow-none print:border-none">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold tracking-tight mb-1">Cartify</h1>
        {recipient && (
          <p className="text-sm text-slate-600 mb-2 py-1">
            Customer: {recipient}
          </p>
        )}
        <p className="text-xs text-slate-500">Premium Inventory & Sales</p>
        <div className="my-4 border-b border-dashed border-slate-300"></div>
      </div>

      <div className="text-sm space-y-1 mb-6 text-slate-600">
        <div className="flex justify-between">
          <span>Receipt ID:</span>
          <span className="text-slate-900 font-medium">#{receiptId}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span className="text-slate-900 font-medium">{date}</span>
        </div>
      </div>

      <div className="mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-slate-600">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-center font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cartItems.map((item) => (
              <tr key={item._id}>
                <td className="py-2.5 font-medium text-slate-900">{item.name}</td>
                <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                <td className="py-2.5 text-right text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-300 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="text-slate-900 font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>VAT (18%)</span>
          <span className="text-slate-900 font-medium">₹{vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-3 mt-3">
          <span>Total</span>
          <span className="text-slate-900">₹{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="barcode h-10 w-48 mx-auto bg-slate-100 mb-3 flex items-center justify-center text-xs text-slate-500 font-mono tracking-widest border border-slate-200 rounded">
          {receiptId}
        </div>
        <p className="text-xs text-slate-500 mb-1">
          Thank you for shopping at Cartify
        </p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;
