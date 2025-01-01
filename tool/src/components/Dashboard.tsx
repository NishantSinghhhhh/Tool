import React, { useEffect, useState } from "react";
// import logo1 from "../assets/AWES_Logo.png";
import logo3 from "../assets/logo.svg";
// import logo2 from "../assets/Ait.png";
import logo4 from "../assets/Ait.svg";
import { results } from "../data/Result";
import { useAuth } from "../context/AuthContext";
import { creds } from "../data/creds.ts";
import { jsPDF } from "jspdf";
import "../assets/Poppins-Regular.ttf"
import "../assets/Montserrat-Regular.ttf"
// import { setFontAndSize } from "pdf-lib";

const Dashboard: React.FC = () => {
  const { username } = useAuth();
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {

    const user = creds.find((cred) => cred.username === username);
    if (user) {
      setSchoolName(user.schoolName);
      console.log(user.schoolName)
    }

   
    const matchedSchool = results.find(
      (schoolData) => schoolData.schoolID === username
    );
    
    if (matchedSchool) {
      setStudents(matchedSchool.students);
    }
  }, [username]);

  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <img src={logo3} alt="Logo" className="h-12 w-auto" />
            <img src={logo4} alt="AWES Logo" className="h-12" />
          </div>
        </div>
      </nav>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Round 1 Results</h1>
            <p className="text-lg text-gray-600">
              Congratulations! These students have successfully qualified for the second round
            </p>
          </div>
          <div className="text-black text-2xl font-bold flex justify-center items-center pb-10">
            {schoolName ? schoolName : "Loading school name..."}
          </div>
          
    </div>
        
 
  );
};

export default Dashboard;
