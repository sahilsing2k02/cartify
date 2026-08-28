import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Cart from '../../components/Cart';

const Portal = () => {
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'tasks', or 'stock'
  const [markedItems, setMarkedItems] = useState({});
  const [taskSubTab, setTaskSubTab] = useState('active');
  const [draftRemarks, setDraftRemarks] = useState({});

  const fetchItems = async () => {
    try { 
      const res = await api.get('/api/items'); 
      setItems(res.data.sort((a, b) => a.name.localeCompare(b.name))); 
    }
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
    let hasDeletedItem = false;

    const filteredItems = task.items
      .filter(i => taskMarks[getItemId(i)])
      .filter(i => {
        const inventoryItem = typeof i.item === 'object' ? i.item : null;
        if (!inventoryItem) {
          hasDeletedItem = true;
          return false;
        }
        return true;
      })
      .map(i => {
        const inventoryItem = typeof i.item === 'object' ? i.item : null;
        return {
          _id: getItemId(i),
          name: inventoryItem?.name || i.name || 'Unknown Item',
          price: inventoryItem?.price ?? 0,
          quantity: i.quantity,
        };
      });

    if (hasDeletedItem) {
      alert('Note: Some checked items were removed from store inventory and were excluded from checkout.');
    }

    if (filteredItems.length === 0) {
      alert('Please tick at least one valid store item to proceed to checkout.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Handle sales and logistics.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button onClick={() => setActiveTab('sales')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'sales' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Sales</button>
          <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tasks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tasks</button>
          <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'stock' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Stock</button>
        </div>
      </div>

      {/* ===== SALES TAB ===== */}
      {activeTab === 'sales' ? (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map(item => (
                <div key={item._id} className="card hover:shadow-md transition-shadow cursor-pointer bg-white" onClick={() => addToCart(item)}>
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-lg uppercase">
                        {item.name.charAt(0)}
                      </div>
                      <div className="text-lg font-medium text-slate-900">₹{item.price.toFixed(2)}</div>
                    </div>
                    <div className="mt-auto">
                      <h3 className="text-sm font-medium text-slate-900 line-clamp-2">{item.name}</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                      Add to Cart
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="font-medium text-slate-900 mb-1">Stock unavailable</p>
                  <p className="text-sm">Waiting for manager to add products.</p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-4">
            <Cart cartTokens={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} clearCart={clearCart} onCheckoutSuccess={fetchItems} />
          </div>
        </div>

      /* ===== STOCK TAB ===== */
      ) : activeTab === 'stock' ? (
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-medium text-slate-900">Current Inventory Stock</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">In Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 text-sm">{item.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">SKU: {item._id.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(item.stock || 0) === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {item.stock || 0} Units
                        </span>
                        {(item.stock || 0) === 0 && <span className="text-xs text-red-600 mt-1 font-medium">Out of Stock</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleReportOutOfStock(item._id)}
                        disabled={item.reportedOutOfStock}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${item.reportedOutOfStock ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
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
          <div className="flex gap-4 items-center border-b border-slate-200 pb-2">
            <button
              onClick={() => setTaskSubTab('active')}
              className={`pb-2 text-sm font-medium transition-colors ${taskSubTab === 'active' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              To Pack
            </button>
            <button
              onClick={() => setTaskSubTab('history')}
              className={`pb-2 text-sm font-medium transition-colors ${taskSubTab === 'history' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              History
            </button>
            <span className="ml-auto text-xs text-slate-500 font-medium">
              {taskSubTab === 'active' ? `${toPackTasks.length} to pack` : `${completedTasks.length} delivered`}
            </span>
          </div>

          {taskSubTab === 'active' ? (
            /* --- TO PACK: pending + packed tasks --- */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {toPackTasks.map(task => (
                <div key={task._id} className="card p-5 flex flex-col h-full bg-white shadow-sm">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium text-slate-900">{task.recipient}</h4>
                        <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium ${task.status === 'packed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{task.status === 'packed' ? 'Packed' : 'Pending'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handoffTaskToCheckout(task)}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded text-xs font-medium hover:bg-primary-700 transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                      Checkout
                    </button>
                  </div>

                  {/* Packing Manifest */}
                  <div className="bg-slate-50 rounded p-4 mb-4 flex-grow border border-slate-200">
                    <p className="text-xs font-medium text-slate-700 mb-2">Pack items for {task.recipient}</p>
                    <ul className="space-y-2">
                      {task.items.map((i, idx) => {
                        const itemId = getItemId(i);
                        const isMarked = !!markedItems[task._id]?.[itemId];
                        return (
                          <li key={idx} className={`flex justify-between items-center text-sm transition-all ${isMarked ? 'text-slate-400' : 'text-slate-700'}`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isMarked}
                                onChange={() => toggleItemMark(task._id, itemId)}
                                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className={isMarked ? 'line-through' : i.item?.name ? '' : 'text-red-500'}>
                                {i.item?.name || '[Removed Item]'}
                              </span>
                            </div>
                            <span className="text-slate-500 text-xs">x{i.quantity}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Remark + Status actions */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <label className="block text-xs font-medium text-slate-700">Staff Remark</label>
                    <textarea
                      rows={2}
                      value={draftRemarks[task._id] ?? task.remark ?? ''}
                      onChange={e => setDraftRemarks(prev => ({ ...prev, [task._id]: e.target.value }))}
                      placeholder="e.g. Rice is out of stock"
                      className="input-field py-2 text-sm"
                    />
                    <button
                      onClick={() => saveRemark(task._id, draftRemarks[task._id] ?? task.remark ?? '')}
                      className="w-full btn btn-secondary text-xs py-2"
                    >
                      Save Remark
                    </button>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => updateTaskStatus(task._id, 'packed')}
                        className="w-full btn btn-primary bg-blue-600 hover:bg-blue-700 text-xs py-2"
                      >
                        Mark as Packed
                      </button>
                    )}
                    {task.status === 'packed' && (
                      <button
                        onClick={() => updateTaskStatus(task._id, 'delivered')}
                        className="w-full btn btn-primary bg-green-600 hover:bg-green-700 text-xs py-2"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {toPackTasks.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
                  <p className="font-medium text-sm">No pending tasks.</p>
                </div>
              )}
            </div>
          ) : (
            /* --- HISTORY: delivered tasks only --- */
            <div className="card bg-white shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h3 className="font-medium text-slate-900">Completed Tasks</h3>
              </div>
              {completedTasks.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                  <p className="font-medium text-sm">No history yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {completedTasks.map(task => (
                    <div key={task._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900 text-sm">{task.recipient}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Delivered
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {task.items.map((i, idx) => (
                          <span key={idx} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${i.item?.name ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {i.item?.name || '[Removed Item]'} <span className="text-slate-500">×{i.quantity}</span>
                          </span>
                        ))}
                      </div>

                      {/* Saved remark */}
                      {task.remark ? (
                        <div className="mb-3 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700">
                          <span className="font-medium">Remark:</span> {task.remark}
                        </div>
                      ) : null}
                      
                      {/* Undo button */}
                      <div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Move "${task.recipient}" back to Packing?`)) {
                              updateTaskStatus(task._id, 'packed');
                            }
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
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
