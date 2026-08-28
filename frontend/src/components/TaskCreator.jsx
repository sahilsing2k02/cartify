import { useState, useEffect } from 'react';
import api from '../utils/api';

const TaskCreator = ({ items, employees = [], onTaskCreated, initialTask, onCancelEdit }) => {
  const [recipient, setRecipient] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // [{ item: id, name: name, price: price, quantity: 1 }]
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialTask) {
      setRecipient(initialTask.recipient);
      setAssignedTo(initialTask.assignedTo?._id || initialTask.assignedTo || '');
      setSelectedItems(
        initialTask.items.map(i => ({
          item: i.item?._id || i.item,
          name: i.item?.name || '[Removed Item]',
          price: i.item?.price || 0,
          quantity: i.quantity
        }))
      );
    } else {
      setRecipient('');
      setAssignedTo('');
      setSelectedItems([]);
    }
  }, [initialTask]);

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
      if (initialTask) {
        await api.put(`/api/tasks/${initialTask._id}`, { recipient, assignedTo, items: selectedItems });
      } else {
        await api.post('/api/tasks', { recipient, assignedTo, items: selectedItems });
      }
      setRecipient('');
      setAssignedTo('');
      setSelectedItems([]);
      onTaskCreated();
      // Optional success indication without alert, letting parent handle state refresh
    } catch (error) {
      console.error(error);
      alert(initialTask ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card overflow-hidden ${initialTask ? 'border-amber-200 shadow-lg shadow-amber-500/5' : 'border-slate-200 shadow-md'} transition-all`}>
      <div className={`px-6 py-5 border-b ${initialTask ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50 border-slate-100'} flex justify-between items-center`}>
        <h3 className={`text-lg font-semibold flex items-center gap-3 ${initialTask ? 'text-amber-800' : 'text-slate-900'}`}>
          <div className={`p-2 rounded-lg ${initialTask ? 'bg-amber-100 text-amber-600' : 'bg-primary-100 text-primary-600'}`}>
            {initialTask ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            )}
          </div>
          {initialTask ? 'Edit Distribution Task' : 'New Distribution Task'}
        </h3>
        {initialTask && (
          <button onClick={onCancelEdit} className="text-xs font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm transition-colors hover:bg-slate-50">
            Cancel Edit
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Recipient Details</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <input 
              type="text" required value={recipient} onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. John Doe - Unit 4B"
              className="input-field pl-10 py-2.5 bg-slate-50/50 focus:bg-white border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">Assign to Employee (Optional)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="input-field pl-10 py-2.5 bg-slate-50/50 focus:bg-white border-slate-300 appearance-none"
            >
              <option value="">-- Unassigned --</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-800">Available Products</label>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length} items
              </span>
            </div>
            <div className="mb-3 relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-8 py-2 text-sm bg-white"
              />
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar p-1 rounded-xl bg-slate-50/50 border border-slate-100">
              {items
                .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(item => (
                <button 
                  key={item._id} type="button" onClick={() => addItemToTask(item)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow hover:border-primary-300 hover:bg-primary-50/50 transition-all flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 group-hover:text-primary-800">{item.name}</span>
                    <span className="text-sm text-slate-500 group-hover:text-primary-600 mt-0.5 font-medium">₹{item.price.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors border border-slate-100 group-hover:border-primary-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                </button>
              ))}
              {items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  <p className="text-sm font-medium">No products found</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-800">Task Load</label>
              <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-medium">{selectedItems.reduce((a, b) => a + b.quantity, 0)} total qty</span>
            </div>
            <div className={`flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar p-1 rounded-xl border ${selectedItems.length > 0 ? 'bg-primary-50/10 border-primary-100/50' : 'bg-slate-50/50 border-slate-100'}`}>
              {selectedItems.map(i => (
                <div key={i.item} className="flex flex-col p-4 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-400 group-hover:bg-primary-500 transition-colors"></div>
                  <div className="flex items-center justify-between pl-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 line-clamp-1">{i.name}</span>
                      <span className="text-xs text-slate-500 font-medium mt-1">₹{(i.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                      <button type="button" onClick={() => updateQuantity(i.item, -1)} className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm font-medium">-</button>
                      <span className="w-8 text-center text-sm font-bold text-slate-700">{i.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(i.item, 1)} className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm font-medium">+</button>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeItem(i.item)} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
              {selectedItems.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="p-4 rounded-full bg-slate-100 mb-3">
                    <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <span className="text-sm font-medium text-slate-500">Cart is empty</span>
                  <span className="text-xs mt-1">Select products to add them to the task</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" disabled={loading}
            className={`w-full py-4 rounded-xl shadow-sm text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              initialTask 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25 focus:ring-amber-500' 
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-500/25 focus:ring-primary-500'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </>
            ) : (
              initialTask ? 'Update Distribution Task' : 'Assign New Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskCreator;
