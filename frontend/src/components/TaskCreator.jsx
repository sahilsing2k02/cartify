import { useState, useEffect } from 'react';
import api from '../utils/api';

const TaskCreator = ({ items, onTaskCreated }) => {
  const [recipient, setRecipient] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // [{ item: id, name: name, quantity: 1 }]
  const [loading, setLoading] = useState(false);

  const addItemToTask = (item) => {
    const existing = selectedItems.find(i => i.item === item._id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.item === item._id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { item: item._id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setSelectedItems(selectedItems.map(i => {
      if (i.item === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(i => i.item !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert('Add at least one item');
    setLoading(true);
    try {
      await api.post('/api/tasks', { recipient, items: selectedItems });
      setRecipient('');
      setSelectedItems([]);
      onTaskCreated();
      alert('Task created successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 bg-slate-50 border-dashed border-2 border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
        New Distribution Task
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Recipient Details (Name / Address)</label>
          <input 
            type="text" required value={recipient} onChange={(e) => setRecipient(e.target.value)}
            placeholder="e.g. John Doe - Unit 4B"
            className="input-field !bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 text-primary-600 uppercase tracking-widest text-[10px]">Select Products</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <button 
                  key={item._id} type="button" onClick={() => addItemToTask(item)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-all flex justify-between items-center group font-medium text-slate-700"
                >
                  <div className="flex flex-col">
                    <span className="text-xs group-hover:text-primary-700">{item.name}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-primary-500 italic">₹{item.price.toFixed(2)}</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 text-primary-600 uppercase tracking-widest text-[10px]">Task Items List</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {selectedItems.map(i => (
                <div key={i.item} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{i.name}</span>
                    <div className="flex gap-2">
                       <span className="text-[9px] text-primary-600 font-bold uppercase tracking-widest">₹{(i.price || 0).toFixed(2)}</span>
                       <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Qty: {i.quantity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQuantity(i.item, -1)} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200">-</button>
                    <button type="button" onClick={() => updateQuantity(i.item, 1)} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200">+</button>
                    <button type="button" onClick={() => removeItem(i.item)} className="ml-2 text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
              {selectedItems.length === 0 && (
                <div className="h-24 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-wider border border-dashed border-slate-200 rounded-lg">
                  No items added
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full btn btn-primary py-3 font-black uppercase tracking-widest text-xs shadow-lg"
        >
          {loading ? 'Processing...' : 'Assign Packing Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskCreator;
