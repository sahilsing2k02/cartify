import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Receipt from './Receipt';
import api from '../utils/api';

const Cart = ({ cartTokens, updateQuantity, removeFromCart, clearCart, onCheckoutSuccess }) => {
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleCheckout = async () => {
    if (cartTokens.length === 0) return;
    if (!customerName.trim()) {
      alert('Please enter a customer name for the bill.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Call backend API to persist sale and decrement stock in MongoDB Atlas
      await api.post('/api/items/checkout', { items: cartTokens });

      // Save current cart for receipt before clearing
      setLastOrder({
        items: [...cartTokens],
        subtotal,
        vat,
        total,
        recipient: customerName
      });
      
      setCheckoutComplete(true);

      // Trigger callback to refresh items list in the parent employee portal
      if (onCheckoutSuccess) {
        onCheckoutSuccess();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || 'Failed to complete checkout. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    clearCart();
    setCustomerName('');
    setCheckoutComplete(false);
    setLastOrder(null);
    setError('');
  };

  return (
    <div className="card sticky top-8 flex flex-col h-[calc(100vh-6rem)]">
      <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900">
          {checkoutComplete ? 'Order Result' : 'Checkout Terminal'}
        </h2>
        <span className="bg-slate-200 text-slate-700 py-0.5 px-2.5 rounded-full text-xs font-medium">
          {checkoutComplete ? 'Completed' : `${cartTokens.reduce((sum, item) => sum + item.quantity, 0)} Items`}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {checkoutComplete ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Sale Finalized</h3>
            <p className="text-slate-500 text-sm mb-6">Generated for {lastOrder?.recipient || 'Customer'}</p>
            
            {/* Hidden Receipt for Printing, Visible for preview in modal style */}
            <div className="w-full border border-slate-200 rounded overflow-hidden shadow-sm mb-6">
               <Receipt 
                 ref={componentRef} 
                 cartItems={lastOrder?.items || []} 
                 subtotal={lastOrder?.subtotal || 0} 
                 vat={lastOrder?.vat || 0} 
                 total={lastOrder?.total || 0} 
                 recipient={lastOrder?.recipient || ''}
               />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={handlePrint}
                className="btn btn-primary py-2.5 w-full flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Print Receipt
              </button>
              <button 
                onClick={handleNewOrder}
                className="btn btn-secondary py-2.5 w-full"
              >
                New Transaction
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {cartTokens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <p className="text-sm">Empty Basket</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {cartTokens.map(item => (
                  <li key={item._id} className="p-3 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-slate-900 leading-snug line-clamp-1">{item.name}</h4>
                        <span className="text-sm font-medium text-slate-900 ml-2">₹{(item.price * item.quantity).toFixed(2)}</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center bg-white border border-slate-200 rounded p-0.5">
                         <button onClick={() => updateQuantity(item._id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">-</button>
                         <span className="text-xs w-8 text-center font-medium text-slate-700">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item._id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">+</button>
                       </div>
                       <button onClick={() => removeFromCart(item._id)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
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
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Customer Name</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sahil"
                className="input-field py-2"
              />
            </div>
            
            <div className="space-y-2 text-sm text-slate-600 bg-white p-4 rounded-md border border-slate-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900 font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span className="text-slate-900 font-medium">₹{vat.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-medium text-slate-900">Total</span>
                <span className="text-lg font-bold text-primary-600">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cartTokens.length === 0 || !customerName.trim() || loading}
            className={`w-full btn py-2.5 flex justify-center items-center gap-2 ${cartTokens.length > 0 && customerName.trim() && !loading ? 'btn-primary' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
          >
             {loading ? 'Processing...' : 'Generate Bill'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
