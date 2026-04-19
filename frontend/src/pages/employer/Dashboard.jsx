import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/items', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setItems(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (editingId) {
        await axios.put(`http://localhost:5000/api/items/${editingId}`, { name, price: Number(price) }, config);
      } else {
        await axios.post('http://localhost:5000/api/items', { name, price: Number(price) }, config);
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
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/items/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stock Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Create and manage your product catalogue.</p>
        </div>
      </div>
      
      <div className="card p-6 mb-10">
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
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit Price ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
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
                    ${item.price.toFixed(2)}
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
  );
};

export default Dashboard;
