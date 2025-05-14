import { Link } from 'react-router-dom';

const Navbar = () => {
  const isAuthenticated = localStorage.getItem('token') !== null;

  return (
    <nav className="w-full bg-white border-b border-purple-200 shadow-sm">
      <div className="w-full px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-purple-600 text-xl font-bold hover:text-purple-800 transition-colors">
          CSV Analyzer
        </Link>
        <div className="flex items-center">
          {isAuthenticated ? (
            <>
              <Link to="/upload" className="text-purple-600 hover:text-purple-800 transition-colors mr-6">
                Upload
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user_id');
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-white shadow-sm hover:shadow-md transition-all"
              >
                Sign Out
              </button>
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