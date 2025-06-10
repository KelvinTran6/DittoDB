import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-purple-200 shadow-sm">
      <div className="w-full px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-purple-600 text-xl font-bold hover:text-purple-800 transition-colors">
          CSV Analyzer
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-purple-600 hover:text-purple-800 transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-white shadow-sm hover:shadow-md transition-all"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/signin" 
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-white shadow-sm hover:shadow-md transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 