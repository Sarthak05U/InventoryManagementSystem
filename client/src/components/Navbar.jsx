import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut, BarChart3, AlertTriangle, Users, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Package className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">InvenTrack</span>
          </div>

          <div className="flex items-center gap-1">
            <Link to="/" className={linkClass('/')}>
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/alerts" className={linkClass('/alerts')}>
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </Link>
            <Link to="/activity" className={linkClass('/activity')}>
              <Activity className="h-4 w-4" />
              Activity
            </Link>
            {user?.role === 'Admin' && (
              <Link to="/admin" className={linkClass('/admin')}>
                <Users className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
