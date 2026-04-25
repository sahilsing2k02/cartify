import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Receipt from './Receipt';

const Cart = ({ cartTokens, updateQuantity, removeFromCart, clearCart }) => {
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const componentRef = useRef();

  useEffect(() => {
    const pendingName = localStorage.getItem('pendingCustomerName');
    if (pendingName) {
      setCustomerName(pendingName);
      localStorage.removeItem('pendingCustomerName');
    }
  }, []);

  const subtotal = cartTokens.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = subtotal * 0.18; // 18% VAT
  const total = subtotal + vat;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const handleCheckout = () => {
    if (cartTokens.length === 0) return;
    if (!customerName.trim()) {
      alert('Please enter a customer name for the bill.');
      return;
    }
    
    // Save current cart for receipt before clearing
    setLastOrder({
      items: [...cartTokens],
      subtotal,
      vat,
      total,
      recipient: customerName
    });
    
    setCheckoutComplete(true);
  };

  const handleNewOrder = () => {
    clearCart();
    setCustomerName('');
    setCheckoutComplete(false);
    setLastOrder(null);
  };

  return (
    <div className="card sticky top-24 flex flex-col h-[calc(100vh-10rem)] shadow-card border-none ring-1 ring-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
          {checkoutComplete ? 'Order Result' : 'Checkout Terminal'}
        </h2>
        <span className="bg-slate-200 text-slate-600 py-0.5 px-2 rounded-full text-[10px] font-bold uppercase">
          {checkoutComplete ? 'Completed' : `${cartTokens.reduce((sum, item) => sum + item.quantity, 0)} Items`}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {checkoutComplete ? (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center p-4 bg-green-50/30">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4 text-green-600 shadow-sm border border-green-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-sans">Sale Finalized</h3>
            <p className="text-slate-500 text-xs font-medium mb-8">Generated for {lastOrder.recipient}</p>
            
            {/* Hidden Receipt for Printing, Visible for preview in modal style */}
            <div className="w-full scale-[0.8] origin-top border rounded-lg overflow-hidden shadow-md transform mb-6">
               <Receipt 
                 ref={componentRef} 
                 cartItems={lastOrder.items} 
                 subtotal={lastOrder.subtotal} 
                 vat={lastOrder.vat} 
                 total={lastOrder.total} 
                 recipient={lastOrder.recipient}
               />
            </div>

            <div className="flex flex-col gap-3 w-full px-4">
              <button 
                onClick={handlePrint}
                className="btn btn-primary py-3 w-full shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Print Receipt
              </button>
              <button 
                onClick={handleNewOrder}
                className="btn btn-secondary py-3 w-full"
              >
                New Transaction
              </button>
            </div>
          </div>
        ) : (
          <>
            {cartTokens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <p className="text-xs font-bold uppercase tracking-wider">Empty Basket</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cartTokens.map(item => (
                  <li key={item._id} className="group p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{item.name}</h4>
                       <span className="text-xs font-bold text-slate-900 ml-2">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-sm">
                        <button onClick={() => updateQuantity(item._id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">-</button>
                        <span className="text-[10px] w-6 text-center font-bold text-slate-700">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="text-slate-300 hover:text-red-500 p-1 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {!checkoutComplete && (
        <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Customer Name</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sahil"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2 text-xs font-medium text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900 tracking-tight">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span className="text-slate-900 tracking-tight">₹{vat.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900">Total</span>
                <span className="text-xl font-black text-primary-600">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cartTokens.length === 0 || !customerName.trim()}
            className={`w-full py-4 px-4 rounded-xl font-black uppercase tracking-widest text-xs text-white shadow-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${cartTokens.length > 0 && customerName.trim() ? 'bg-primary-600 hover:bg-primary-700' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
          >
             Finalize & Generate Bill
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
