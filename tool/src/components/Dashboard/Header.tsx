import React from "react";
import logo3 from "../../assets/logo.svg";
import logo4 from "../../assets/Ait.svg";

const Header: React.FC = () => (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <img src={logo3} alt="Logo" className="h-12 w-auto" />
          <img src={logo4} alt="AWES Logo" className="h-12" />
        </div>
      </div>
    </nav>
  );
  
  export default Header;
  