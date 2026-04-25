import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Cart from '../../components/Cart';

const Portal = () => {
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'tasks', or 'stock'
  const [printingTask, setPrintingTask] = useState(null);
  const [markedItems, setMarkedItems] = useState({});
  const [taskSubTab, setTaskSubTab] = useState('active');
  const [draftRemarks, setDraftRemarks] = useState({});
  const { user } = useContext(AuthContext);

  const fetchItems = async () => {
    try { const res = await api.get('/api/items'); setItems(res.data); }
    catch (error) { console.error(error); }
  };

  const fetchTasks = async () => {
    try { const res = await api.get('/api/tasks'); setTasks(res.data); }
    catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchItems();
    fetchTasks();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/api/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (error) { console.error(error); }
  };

  const saveRemark = async (taskId, remark) => {
    try {
      await api.put(`/api/tasks/${taskId}/remark`, { remark });
      fetchTasks();
    } catch (error) { console.error(error); }
  };

  // Local draft remarks (before saving): { taskId: string }

  const handleReportOutOfStock = async (itemId) => {
    try {
      await api.put(`/api/items/${itemId}/report`);
      fetchItems();
      alert('Out of stock report sent to management.');
    } catch (error) { console.error(error); }
  };

  // Consistently resolve the unique string ID for a task item
  const getItemId = (i) => {
    if (i.item && typeof i.item === 'object') return i.item._id?.toString();
    if (i.item) return i.item.toString();
    return i._id?.toString();
  };

  const toggleItemMark = (taskId, itemId) => {
    setMarkedItems(prev => {
      const taskMarks = prev[taskId] || {};
      const key = itemId?.toString();
      return { ...prev, [taskId]: { ...taskMarks, [key]: !taskMarks[key] } };
    });
  };

  const handoffTaskToCheckout = (task) => {
    const taskMarks = markedItems[task._id] || {};
    const filteredItems = task.items
      .filter(i => taskMarks[getItemId(i)])
      .map(i => {
        const inventoryItem = typeof i.item === 'object' ? i.item : null;
        return {
          _id: getItemId(i),
          name: i.name || inventoryItem?.name,
          price: inventoryItem?.price ?? i.price ?? 0,
          quantity: i.quantity,
        };
      });

    if (filteredItems.length === 0) {
      alert('Please tick at least one item to proceed to checkout.');
      return;
    }
    setCart(filteredItems);
    localStorage.setItem('pendingCustomerName', task.recipient);
    setActiveTab('sales');
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c._id === item._id);
      if (existing) return prev.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, amount) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + amount;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item._id !== id));
  const clearCart = () => setCart([]);

  const toPackTasks = tasks.filter(t => t.status !== 'delivered');   // pending + packed
  const completedTasks = tasks.filter(t => t.status === 'delivered'); // history: delivered only

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in relative">
      {/* Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Employee Portal</h1>
          <p className="text-slate-500 mt-1 font-medium">Handle sales terminal and distribution logistics.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
          <button onClick={() => setActiveTab('sales')} className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'sales' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Sales</button>
          <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'tasks' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tasks</button>
          <button onClick={() => setActiveTab('stock')} className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'stock' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Stock</button>
        </div>
      </div>


      {/* ===== SALES TAB ===== */}
      {activeTab === 'sales' ? (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map(item => (
                <div key={item._id} className="card group hover:ring-2 hover:ring-primary-500/10 hover:border-primary-200 transition-all active:scale-[0.98] cursor-pointer" onClick={() => addToCart(item)}>
                  <div className="p-5 flex flex-col h-full bg-white">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-primary-600 group-hover:text-white transition-all">
                        {item.name.charAt(0)}
                      </div>
                      <div className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">₹{item.price.toFixed(2)}</div>
                    </div>
                    <div className="mt-auto">
                      <h3 className="text-sm font-bold text-slate-700 leading-tight uppercase tracking-tight line-clamp-2">{item.name}</h3>
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
                  <p className="font-bold text-slate-900 mb-1">Stock unavailable</p>
                  <p className="text-xs">Waiting for store manager to add products.</p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-4">
            <Cart cartTokens={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />
          </div>
        </div>

      /* ===== STOCK TAB ===== */
      ) : activeTab === 'stock' ? (
        <div className="card overflow-hidden border-none shadow-premium bg-white">
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Current Inventory Stock</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time availability monitoring</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 text-sm group-hover:text-primary-600 transition-colors uppercase tracking-tight">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">SKU: {item._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full font-black text-xs ring-1 ${(item.stock || 0) === 0 ? 'bg-red-50 text-red-600 ring-red-100' : 'bg-green-50 text-green-600 ring-green-100'}`}>
                          {item.stock || 0} Units
                        </span>
                        {(item.stock || 0) === 0 && <span className="text-[9px] text-red-400 font-black uppercase mt-1">Out of Stock</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleReportOutOfStock(item._id)}
                        disabled={item.reportedOutOfStock}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${item.reportedOutOfStock ? 'bg-slate-100 text-slate-300' : 'bg-amber-50 text-amber-600 hover:bg-amber-100 ring-1 ring-amber-100'}`}
                      >
                        {item.reportedOutOfStock ? 'Reported' : 'Report Empty'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      /* ===== TASKS TAB ===== */
      ) : (
        <div className="space-y-6">
          {/* Sub-tab switcher */}
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setTaskSubTab('active')}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border ${taskSubTab === 'active' ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}
            >
              📦 To Pack
            </button>
            <button
              onClick={() => setTaskSubTab('history')}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border ${taskSubTab === 'history' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
            >
              🗂️ History
            </button>
            <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {taskSubTab === 'active' ? `${toPackTasks.length} to pack` : `${completedTasks.length} delivered`}
            </span>
          </div>

          {taskSubTab === 'active' ? (
            /* --- TO PACK: pending + packed tasks --- */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {toPackTasks.map(task => (
                <div key={task._id} className="card p-6 flex flex-col h-full hover:shadow-lg transition-all animate-fade-in group">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${task.status === 'packed' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight leading-tight">{task.recipient}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${task.status === 'packed' ? 'text-blue-400' : 'text-amber-400'}`}>{task.status === 'packed' ? 'Packed' : 'Pending'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handoffTaskToCheckout(task)}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 shadow-md flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                      Checkout
                    </button>
                  </div>

                  {/* Packing Manifest */}
                  <div className="bg-slate-50/50 rounded-xl p-4 mb-4 flex-grow border border-slate-100">
                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-2">⚠️ Pack items for {task.recipient}</p>
                    <div className="my-2 border-b border-dashed border-slate-200"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tick items as you pack them</p>
                    <ul className="space-y-2.5">
                      {task.items.map((i, idx) => {
                        const itemId = getItemId(i);
                        const isMarked = !!markedItems[task._id]?.[itemId];
                        return (
                          <li key={idx} className={`flex justify-between items-center text-xs font-bold transition-all ${isMarked ? 'text-primary-600' : 'text-slate-700'}`}>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isMarked}
                                onChange={() => toggleItemMark(task._id, itemId)}
                                className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-indigo-600"
                              />
                              <span className={isMarked ? 'line-through opacity-50' : ''}>{i.name}</span>
                            </div>
                            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] tabular-nums shadow-sm">x{i.quantity}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Remark + Status actions */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Remark</label>
                    <textarea
                      rows={2}
                      value={draftRemarks[task._id] ?? task.remark ?? ''}
                      onChange={e => setDraftRemarks(prev => ({ ...prev, [task._id]: e.target.value }))}
                      placeholder="e.g. All items delivered / Rice is out of stock…"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                    <button
                      onClick={() => saveRemark(task._id, draftRemarks[task._id] ?? task.remark ?? '')}
                      className="w-full py-1.5 rounded-lg bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                    >
                      Save Remark
                    </button>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => updateTaskStatus(task._id, 'packed')}
                        className="w-full btn btn-primary !bg-blue-600 hover:!bg-blue-700 text-xs py-2.5 font-black uppercase tracking-widest"
                      >
                        Mark as Packed
                      </button>
                    )}
                    {task.status === 'packed' && (
                      <button
                        onClick={() => updateTaskStatus(task._id, 'delivered')}
                        className="w-full btn btn-primary !bg-green-600 hover:!bg-green-700 text-xs py-2.5 font-black uppercase tracking-widest"
                      >
                        ✓ Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {toPackTasks.length === 0 && (
                <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-300">
                  <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path></svg>
                  <p className="font-bold text-xs uppercase tracking-widest">All caught up! No pending tasks.</p>
                </div>
              )}
            </div>
          ) : (
            /* --- HISTORY: delivered tasks only --- */
            <div className="card overflow-hidden border-none bg-white shadow-soft">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Completed Tasks</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Previously packed or delivered orders</p>
              </div>
              {completedTasks.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-300">
                  <svg className="w-10 h-10 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                  <p className="font-bold text-xs uppercase tracking-widest">No history yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {completedTasks.map(task => (
                    <div key={task._id} className="px-6 py-5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">{task.recipient}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                            ✓ Delivered
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(task.updatedAt || task.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-5 mb-3">
                        {task.items.map((i, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            {i.name} <span className="text-slate-400">×{i.quantity}</span>
                          </span>
                        ))}
                      </div>

                      {/* Saved remark */}
                      {task.remark ? (
                        <div className="ml-5 mb-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          <svg className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                          <p className="text-[10px] font-bold text-amber-700 leading-relaxed">{task.remark}</p>
                        </div>
                      ) : (
                        <p className="ml-5 mb-4 text-[10px] text-slate-300 italic font-medium">No remark added.</p>
                      )}
                      {/* Undo button */}
                      <div className="ml-5">
                        <button
                          onClick={() => {
                            if (window.confirm(`Move "${task.recipient}" back to Packing?`)) {
                              updateTaskStatus(task._id, 'packed');
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 hover:bg-amber-100 ring-1 ring-amber-100 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                          Undo — Move Back to Packing
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Portal;
