import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-12 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 text-purple-600">Welcome to CSV Analyzer</h1>
        <p className="text-xl mb-10 text-gray-600 leading-relaxed">
          Upload your CSV files, analyze your data, and generate insights with ease. Our app helps you visualize and understand your data quickly.
        </p>
        <Link 
          to="/signin" 
          className="inline-block px-8 py-4 bg-purple-600 rounded-lg hover:bg-purple-700 text-lg text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Landing; 