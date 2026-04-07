import { useState, useEffect } from 'react';
import api from '../api/axios';
import { AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const Alerts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await api.get('/api/items/alerts');
        setItems(data);
      } catch (error) {
        toast.error('Failed to fetch alerts');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-7 w-7 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h1>
        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
          {items.length} items
        </span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">All items are well-stocked!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between ${
                item.quantity === 0 ? 'border-red-300 bg-red-50' : 'border-yellow-200 bg-yellow-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    item.quantity === 0 ? 'bg-red-100' : 'bg-yellow-100'
                  }`}
                >
                  <AlertTriangle
                    className={`h-6 w-6 ${item.quantity === 0 ? 'text-red-600' : 'text-yellow-600'}`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    SKU: {item.sku} | Category: {item.category} | Supplier: {item.supplier}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-3xl font-bold ${
                    item.quantity === 0 ? 'text-red-600' : 'text-yellow-600'
                  }`}
                >
                  {item.quantity}
                </p>
                <p className="text-xs text-gray-500">units left</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
