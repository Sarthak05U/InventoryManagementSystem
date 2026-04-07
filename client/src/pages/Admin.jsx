import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, CheckCircle, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const roleColors = {
  Admin: 'bg-purple-100 text-purple-700',
  Manager: 'bg-blue-100 text-blue-700',
  Staff: 'bg-gray-100 text-gray-700',
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, pendingRes] = await Promise.all([
        api.get('/api/auth/users'),
        api.get('/api/auth/pending'),
      ]);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await api.patch(`/api/auth/approve/${userId}`);
      toast.success('User approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

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
        <Shield className="h-7 w-7 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Approvals ({pendingUsers.length})
          </h2>
          <div className="grid gap-3">
            {pendingUsers.map((u) => (
              <div
                key={u._id}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${roleColors[u.role]}`}>
                    {u.role}
                  </span>
                </div>
                <button
                  onClick={() => handleApprove(u._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          All Users ({users.length})
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.approved ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <Clock className="h-4 w-4" /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
