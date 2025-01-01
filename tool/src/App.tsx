import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Login from "./components/Login";
import { AuthProvider } from "./context/AuthContext";
import SchoolRanking from  "./components/SchoolRanking";

const App = () => {
  return (
    <AuthProvider>

    <Router>
      <div className="w-[100vw] h-[100vh]">
        <div className=" w-[100%] h-[100%]"> {/* This ensures content doesn't overlap with the navbar */}
          <Routes>
            <Route path="/" element={<Login />} />  
            <Route path="/SchoolRanking" element={<SchoolRanking />} />  
            {/* <Route path="/Pdf1" element={<Pdf1/>} />   */}
          </Routes>
        </div>
      </div>
    </Router>
    </AuthProvider>
  );
};

export default App;
