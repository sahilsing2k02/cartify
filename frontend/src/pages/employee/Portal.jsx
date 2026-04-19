import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Cart from '../../components/Cart';

const Portal = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/items', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, [user.token]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find(cartItem => cartItem._id === item._id);
      if (existing) {
        return prevCart.map(cartItem => 
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, amount) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item._id === id) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terminal Sales</h1>
        <p className="text-slate-500 mt-1 font-medium">Point-of-sale interface for rapid order processing.</p>
      </div>
      
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
        {/* Product Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map(item => (
              <div 
                key={item._id} 
                className="card group hover:ring-2 hover:ring-primary-500/10 hover:border-primary-200 transition-all active:scale-[0.98] cursor-pointer"
                onClick={() => addToCart(item)}
              >
                <div className="p-5 flex flex-col h-full bg-white">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-primary-600 group-hover:text-white transition-all">
                      {item.name.charAt(0)}
                    </div>
                    <div className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-sm font-bold text-slate-700 leading-tight uppercase tracking-tight line-clamp-2">
                       {item.name}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary-500 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Add to Cart
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full card bg-slate-50 border-dashed border-slate-300 p-12 text-center text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <p className="font-bold text-slate-900 mb-1">Stock unavailable</p>
                <p className="text-xs">Waiting for store manager to add products.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Cart Sidebar */}
        <div className="lg:col-span-4">
          <Cart 
            cartTokens={cart} 
            updateQuantity={updateQuantity} 
            removeFromCart={removeFromCart} 
            clearCart={clearCart} 
          />
        </div>
      </div>
    </div>
  );
};

export default Portal;
