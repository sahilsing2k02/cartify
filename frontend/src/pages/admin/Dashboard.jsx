import { useState, useEffect } from 'react';
import api from '../../utils/api';
import TaskCreator from '../../components/TaskCreator';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'tasks', 'stock', or 'activity'
  const [error, setError] = useState('');
  const [stockInputs, setStockInputs] = useState({});
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const fetchItems = async () => {
    try {
      const res = await api.get('/api/items');
      setItems(res.data);
      const initialStockMap = {};
      res.data.forEach(item => {
        initialStockMap[item._id] = item.stock || 0;
      });
      setStockInputs(initialStockMap);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/auth/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchTasks();
    fetchSessions();
  }, []);

  const handleUpdateStock = async (itemId, newStock) => {
    setError('');
    try {
      await api.put(`/api/items/${itemId}/stock`, { stock: Number(newStock) });
      fetchItems();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update stock');
      fetchItems(); // revert to last valid server state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save product details.');
    }
  };

  const handleEdit = (item) => {
    setName(item.name);
    setPrice(item.price);
    setEditingId(item._id);
    setActiveTab('inventory');
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await api.delete(`/api/items/${id}`);
      setDeleteConfirmId(null);
      fetchItems();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleDeleteTaskConfirm = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setDeleteConfirmTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleToggleBlock = async (userId, isBlocked) => {
    try {
      const endpoint = isBlocked ? `/api/auth/users/${userId}/unblock` : `/api/auth/users/${userId}/block`;
      await api.put(endpoint);
      fetchSessions();
    } catch (error) {
      console.error('Error toggling block state:', error);
      alert(error.response?.data?.message || 'Failed to update user access.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Control inventory and assign logistics tasks.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tasks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Distribution
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'stock' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Stock
          </button>
          <button 
            onClick={() => { setActiveTab('activity'); fetchSessions(); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'activity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Activity Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-medium text-sm">Dismiss</button>
        </div>
      )}
      
      {activeTab === 'inventory' ? (
        <div className="space-y-8">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-medium text-slate-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-6 lg:col-span-7">
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Coffee Beans"
                  className="input-field"
                />
              </div>
              <div className="md:col-span-3 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input 
                    type="number" required min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-7"
                  />
                </div>
              </div>
              <div className="md:col-span-3 lg:col-span-2 flex gap-2">
                <button type="submit" className="w-full btn btn-primary">
                  {editingId ? 'Save' : 'Add'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setName(''); setPrice(''); }} className="btn btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-medium text-slate-900">
                Active Inventory
              </h3>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={inventorySearchTerm}
                  onChange={(e) => setInventorySearchTerm(e.target.value)}
                  className="input-field pl-8 py-1.5 text-sm bg-white"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {items
                    .filter(item => item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(item => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-semibold uppercase text-xs">
                            {item.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {deleteConfirmId === item._id ? (
                          <div className="flex justify-end items-center gap-2">
                            <span className="text-sm text-red-600 mr-2">Confirm?</span>
                            <button 
                              onClick={() => handleDeleteConfirm(item._id)} 
                              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors"
                            >
                              Yes
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmId(null)} 
                              className="text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleEdit(item)} className="text-primary-600 hover:text-primary-900">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteClick(item._id)} className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {items.filter(item => item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                        No products found matching "{inventorySearchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'stock' ? (
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
             <h3 className="font-medium text-slate-900">Stock Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">In Stock</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Sold</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Delivered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Update Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {items
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(item => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 text-sm">{item.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {item._id.slice(-8)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                        {item.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                      {item.sold || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                      {item.delivered || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <input 
                          type="number" 
                          min="0"
                          value={stockInputs[item._id] ?? item.stock ?? 0}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStockInputs(prev => ({ ...prev, [item._id]: val === '' ? '' : Math.max(0, val) }));
                          }}
                          onBlur={(e) => handleUpdateStock(item._id, Math.max(0, e.target.value || 0))}
                          className="input-field py-1"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.reportedOutOfStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Reported Empty
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'activity' ? (
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-medium text-slate-900">System Access Logs</h3>
            <button 
              onClick={fetchSessions}
              className="btn btn-secondary py-1 px-3 text-xs"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sign In Time</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sign Out Time</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sessions.map(session => {
                  const loginDate = session.loginTime ? new Date(session.loginTime) : null;
                  const logoutDate = session.logoutTime ? new Date(session.logoutTime) : null;
                  
                  let durationStr = 'N/A';
                  let isOnline = false;
                  
                  if (loginDate) {
                    if (logoutDate) {
                      const diffMs = logoutDate - loginDate;
                      const diffSecs = Math.floor(diffMs / 1000);
                      const mins = Math.floor(diffSecs / 60);
                      const secs = diffSecs % 60;
                      durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                    } else {
                      durationStr = 'Ongoing';
                      isOnline = true;
                    }
                  }

                  return (
                    <tr key={session._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 text-sm">{session.username}</span>
                              {session.isBlocked && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Blocked
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 capitalize">{session.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {loginDate ? loginDate.toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {isOnline ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : logoutDate ? (
                          <span className="text-slate-500">{logoutDate.toLocaleString()}</span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-500 whitespace-nowrap font-mono">
                        {durationStr}
                      </td>
                      <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                        {session.role === 'admin' ? (
                          <span className="text-slate-400 text-xs">Unrestricted</span>
                        ) : (
                          <button
                            onClick={() => handleToggleBlock(session._id, session.isBlocked)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              session.isBlocked
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {session.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">
                      No sessions recorded.
                    </td>
                  </tr>
                )}
               </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <TaskCreator 
              items={items} 
              onTaskCreated={() => {
                fetchTasks();
                setEditingTask(null);
              }} 
              initialTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
            />
          </div>
          <div className="lg:col-span-6">
            <div className="card h-full">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-medium text-slate-900">Assigned Logistics Tasks</h3>
                <span className="text-xs text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full">{tasks.length} Total</span>
              </div>
              <div className="p-6 space-y-4">
                {tasks.map(task => (
                  <div key={task._id} className="group p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Status Indicator Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      task.status === 'delivered' ? 'bg-green-500' : 
                      task.status === 'packed' ? 'bg-blue-500' : 'bg-amber-400'
                    }`} />
                    
                    <div className="flex justify-between items-start mb-4 pl-2">
                      <div>
                        <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          {task.recipient}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            task.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            task.status === 'packed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {task.status}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Created {new Date(task.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {deleteConfirmTaskId === task._id ? (
                          <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                            <span className="text-xs text-red-600 font-medium">Delete?</span>
                            <button onClick={() => handleDeleteTaskConfirm(task._id)} className="text-white bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded text-xs transition-colors">Yes</button>
                            <button onClick={() => setDeleteConfirmTaskId(null)} className="text-slate-600 hover:bg-slate-200 px-2 py-0.5 rounded text-xs transition-colors">No</button>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => setEditingTask(task)}
                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                              title="Edit Task"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmTaskId(task._id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete Task"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="pl-2">
                      <div className="flex flex-wrap gap-2 mt-3">
                        {task.items.map((i, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                            <span className={`w-2 h-2 rounded-full ${i.item?.name ? 'bg-slate-400' : 'bg-red-400'}`}></span>
                            <span className="text-xs font-medium text-slate-700">
                              {i.item?.name || 'Unknown Item'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono bg-white px-1.5 rounded border border-slate-100">
                              x{i.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {task.remark && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
                          <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                          <div>
                            <p className="text-xs font-medium text-slate-700">Staff Remark</p>
                            <p className="text-sm text-slate-600 mt-0.5">{task.remark}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <p className="text-sm font-medium text-slate-600">No tasks assigned yet</p>
                    <p className="text-xs mt-1">Create a new distribution task to get started.</p>
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
