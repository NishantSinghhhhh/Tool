import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Excel from "./components/Excel";  // Import the Excel component
import Pdf from "./components/Pdf";

const App = () => {
  return (
    <Router>
      <div>
        <nav className="bg-blue-600 p-4 shadow-lg fixed top-0 left-0 w-full z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-white text-2xl font-semibold">My App</h1>
            <ul className="flex space-x-6">
              <li>
                <Link
                  to="/"
                  className="text-white hover:text-blue-200 transition duration-300 ease-in-out"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/Pdf"
                  className="text-white hover:text-blue-200 transition duration-300 ease-in-out"
                >
                  New Page
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="pt-20"> {/* This ensures content doesn't overlap with the navbar */}
          <Routes>
            <Route path="/" element={<Excel />} />  
            <Route path="/Pdf" element={<Pdf />} />  
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
