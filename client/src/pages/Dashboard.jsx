import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ItemModal from '../components/ItemModal';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

  const canModify = user?.role === 'Admin' || user?.role === 'Manager';
  const canDelete = user?.role === 'Admin';

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (category) params.category = category;

      const { data } = await api.get('/api/items', { params });
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/items/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchAlertCount = async () => {
    try {
      const { data } = await api.get('/api/items/alerts');
      setAlertCount(data.length);
    } catch (error) {
      console.error('Failed to fetch alerts');
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchCategories();
    fetchAlertCount();
  }, []);

  const handleCreate = async (formData) => {
    try {
      await api.post('/api/items', formData);
      toast.success('Item created!');
      setModalOpen(false);
      fetchItems();
      fetchCategories();
      fetchAlertCount();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create item');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await api.put(`/api/items/${editingItem._id}`, formData);
      toast.success('Item updated!');
      setModalOpen(false);
      setEditingItem(null);
      fetchItems();
      fetchCategories();
      fetchAlertCount();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/api/items/${id}`);
      toast.success('Item deleted!');
      fetchItems();
      fetchAlertCount();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${alertCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <AlertTriangle className={`h-6 w-6 ${alertCount > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock Alerts</p>
              <p className={`text-2xl font-bold ${alertCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {alertCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {canModify && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                  {(canModify || canDelete) && (
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.sku}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm text-right font-semibold ${item.quantity < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity < 10 && <AlertTriangle className="h-4 w-4 inline mr-1" />}
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.supplier}</td>
                    {(canModify || canDelete) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canModify && (
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {pages} ({total} items)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ItemModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={editingItem ? handleUpdate : handleCreate}
        item={editingItem}
      />
    </div>
  );
};

export default Dashboard;
