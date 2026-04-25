import { forwardRef } from 'react';

const Receipt = forwardRef(({ cartItems, subtotal, vat, total, recipient }, ref) => {
  const date = new Date().toLocaleString();
  const receiptId = Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div ref={ref} className="bg-white p-8 max-w-sm mx-auto font-mono text-slate-800 border shadow-sm print:shadow-none print:border-none">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black tracking-tighter uppercase mb-1">Cartify</h1>
        {recipient && (
          <p className="text-[10px] text-primary-600 font-black uppercase tracking-[0.2em] mb-2 border-y border-primary-100 py-1">
            Customer: {recipient}
          </p>
        )}
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Premium Inventory & Sales</p>
        <div className="my-4 border-b border-dashed border-slate-300"></div>
      </div>

      <div className="text-[10px] space-y-1 mb-6 uppercase font-bold text-slate-500">
        <div className="flex justify-between">
          <span>Receipt ID:</span>
          <span className="text-slate-900"># {receiptId}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span className="text-slate-900">{date}</span>
        </div>
      </div>

      <div className="mb-6">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2 border-slate-900 text-left">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cartItems.map((item) => (
              <tr key={item._id}>
                <td className="py-3 font-bold uppercase tracking-tight">{item.name}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-slate-900 pt-4 space-y-2 text-sm font-bold">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600 font-medium">
          <span>VAT (18%)</span>
          <span>₹{vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-black border-t-2 border-slate-100 pt-2 mt-2">
          <span>Total</span>
          <span className="text-primary-600">₹{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-10 text-center">
        <div className="barcode h-8 w-48 mx-auto bg-slate-100 mb-4 flex items-center justify-center text-[10px] text-slate-400 font-bold">
          [ BARCODE: {receiptId} ]
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Thank you for shopping at Cartify
        </p>
        <p className="text-[8px] text-slate-300 mt-2">Software by Antigravity v2.1</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;
