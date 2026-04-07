import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Activity, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const actionIcon = {
  CREATE: <Plus className="h-4 w-4 text-green-600" />,
  UPDATE: <Edit2 className="h-4 w-4 text-blue-600" />,
  DELETE: <Trash2 className="h-4 w-4 text-red-600" />,
};

const actionColor = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/activity', { params: { page, limit: 20 } });
        setLogs(data.logs);
        setPages(data.pages);
      } catch (error) {
        toast.error('Failed to fetch activity logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

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
        <Activity className="h-7 w-7 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No activity recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log._id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50">
                <div className="mt-0.5">{actionIcon[log.action]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${actionColor[log.action]}`}>
                      {log.action}
                    </span>
                    <span className="font-medium text-gray-900">{log.itemName}</span>
                  </div>
                  <p className="text-sm text-gray-500">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    by {log.userId?.name || 'Unknown'} &middot;{' '}
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {page} of {pages}</p>
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
      )}
    </div>
  );
};

export default ActivityLog;
