import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import TaskCreator from '../../components/TaskCreator';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'tasks', or 'stock'
  const { user } = useContext(AuthContext);

  const fetchItems = async () => {
    try {
      const res = await api.get('/api/items');
      setItems(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchTasks();
  }, []);

  const handleUpdateStock = async (itemId, newStock) => {
    try {
      await api.put(`/api/items/${itemId}/stock`, { stock: Number(newStock) });
      fetchItems();
    } catch (error) {
      console.error(error);
      alert('Failed to update stock');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/items/${editingId}`, { name, price: Number(price) });
      } else {
        await api.post('/api/items', { name, price: Number(price) });
      }
      setName('');
      setPrice('');
      setEditingId(null);
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setName(item.name);
    setPrice(item.price);
    setEditingId(item._id);
    setActiveTab('inventory');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/items/${id}`);
        fetchItems();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Employer Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Control inventory and assign logistics tasks.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'tasks' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Distribution
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'stock' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Stock
          </button>
        </div>
      </div>
      
      {activeTab === 'inventory' ? (
        <div className="space-y-10">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${editingId ? 'bg-amber-400' : 'bg-primary-500'}`}></div>
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Product Details' : 'Register New Product'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              <div className="md:col-span-6 lg:col-span-7">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Coffee Beans"
                  className="input-field !bg-white"
                />
              </div>
              <div className="md:col-span-3 lg:col-span-3">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input 
                    type="number" required min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="input-field !bg-white !pl-7"
                  />
                </div>
              </div>
              <div className="md:col-span-3 lg:col-span-2 flex gap-2">
                <button type="submit" className="flex-1 btn btn-primary py-2 font-bold shadow-md">
                  {editingId ? 'Save' : 'Add'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setName(''); setPrice(''); }} className="btn btn-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Active Inventory
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{items.length}</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Product Reference</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Pricing</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {items.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors uppercase">
                            {item.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold italic">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(item)} className="p-1 px-2.5 rounded-md text-primary-600 hover:bg-primary-50 font-bold text-xs uppercase tracking-tighter">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-1 px-2.5 rounded-md text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-tighter">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-20 text-center">
                        <div className="max-w-xs mx-auto text-slate-400">
                          <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                          <p className="font-bold text-slate-900 mb-1">Stock empty</p>
                          <p className="text-xs">Your inventory is currently empty. Add products to begin selling.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'stock' ? (
        <div className="card overflow-hidden border-none shadow-premium bg-white">
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex justify-between items-center">
             <div>
               <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Stock Inventory</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage unit counts and monitor reports</p>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-tighter ring-1 ring-red-100">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                  Monitor Reports
                </div>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">In Stock</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Stock Level</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 text-sm group-hover:text-primary-600 transition-colors uppercase tracking-tight">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium font-mono tracking-tighter">ID: {item._id.slice(-8).toUpperCase()}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm ring-1 ${item.stock === 0 ? 'bg-red-50 text-red-600 ring-red-100' : 'bg-slate-50 text-slate-700 ring-slate-100'}`}>
                        {item.stock || 0}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 max-w-[160px]">
                        <input 
                          type="number" 
                          defaultValue={item.stock || 0}
                          onBlur={(e) => handleUpdateStock(item._id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary-500/10 outline-none"
                        />
                        <div className="text-[9px] text-slate-400 font-bold uppercase whitespace-nowrap">Units</div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {item.reportedOutOfStock ? (
                        <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                           Reported Empty
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 xl:col-span-4">
            <TaskCreator items={items} onTaskCreated={fetchTasks} />
          </div>
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="card h-full">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Assigned Logistics Tasks</h3>
              </div>
              <div className="p-6 space-y-4">
                {tasks.map(task => (
                  <div key={task._id} className="p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{task.recipient}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Created {new Date(task.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        task.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                        task.status === 'packed' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task.items.map((i, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-600">
                          {i.name} (x{i.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                    <svg className="w-12 h-12 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <p className="font-bold text-xs uppercase tracking-widest">No tasks assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
