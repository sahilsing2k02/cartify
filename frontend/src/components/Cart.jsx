import { useState } from 'react';

const Cart = ({ cartTokens, updateQuantity, removeFromCart, clearCart }) => {
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const subtotal = cartTokens.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = subtotal * 0.18; // 18% VAT
  const total = subtotal + vat;

  const handleCheckout = () => {
    if (cartTokens.length === 0) return;
    setCheckoutComplete(true);
    setTimeout(() => {
      clearCart();
      setCheckoutComplete(false);
    }, 4000);
  };

  return (
    <div className="card sticky top-24 flex flex-col h-[calc(100vh-10rem)] shadow-card border-none ring-1 ring-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
          Checkout
        </h2>
        <span className="bg-slate-200 text-slate-600 py-0.5 px-2 rounded-full text-[10px] font-bold uppercase">
          {cartTokens.reduce((sum, item) => sum + item.quantity, 0)} Items
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {checkoutComplete ? (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center p-6 bg-green-50/30">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-6 text-green-600 shadow-sm border border-green-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Receipt Issued</h3>
            <p className="text-slate-500 text-xs font-medium">The order has been finalized and data synchronized.</p>
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
                       <span className="text-xs font-bold text-slate-900 ml-2">${(item.price * item.quantity).toFixed(2)}</span>
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
        <div className="p-5 bg-slate-50 border-t border-slate-100">
          <div className="space-y-2 mb-6 text-xs font-medium text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-900 tracking-tight">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (18%)</span>
              <span className="text-slate-900 tracking-tight">${vat.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center bg-transparent">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-xl font-black text-primary-600">${total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cartTokens.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${cartTokens.length > 0 ? 'bg-primary-600 hover:bg-primary-700' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
          >
             Finalize Order
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
