import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Login from "./components/Login";
import { AuthProvider } from "./context/AuthContext";
import SchoolRanking from  "./components/DataGeneration/SchoolRanking";
import MarksFrequency from "./components/DataGeneration/MarksFrequency";
import Dashboard from "./components/Dashboard";
import { DataProvider } from "./context/SchoolDataContext";

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="w-[100vw] h-[100vh]">
            <div className=" w-[100%] h-[100%]"> {/* This ensures content doesn't overlap with the navbar */}
              <Routes>
                <Route path="/" element={<Login />} />  
                <Route path="/SchoolRanking" element={<SchoolRanking />} />  
                <Route path="/MarksFrequency" element={<MarksFrequency />} />  
                <Route path="/Dashboard" element={<Dashboard />} />  
                {/* <Route path="/Pdf1" element={<Pdf1/>} />   */}
              </Routes>
            </div>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
