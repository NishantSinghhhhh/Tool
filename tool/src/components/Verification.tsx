import React, { useState, FormEvent } from "react";
import logo from "../assets/logomyaimate.png";
import logoait from "../assets/AIT.png";
import axios from "axios";

interface CertificateDetails {
  certificateId: string;
  holderName: string;
  category: string;
  school: string;
  issueDate: string;
  status: string;
}

interface VerificationResult {
  isValid: boolean;
  certificateDetails?: CertificateDetails;
}

const NumberVerificationForm: React.FC = () => {
  const [number, setNumber] = useState<string>("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    if (!number.trim()) {
      setError("Please enter a certificate number.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<VerificationResult>("/api/verify-certificate", {
        certificateNumber: number,
      });

      setResult(response.data);
    } catch (err) {
      setError("Failed to verify certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full w-full flex flex-col items-center justify-center bg-gray-50 p-4 pt-[100px]">
      {/* Header Section */}
      <div className="w-full h-[100px] p-6 flex fixed top-0 justify-between items-center bg-white shadow-md">
        <img src={logo} alt="Logo" className="h-12 w-12" />
        <img src={logoait} alt="Secondary Logo" className="h-12 w-12" />
      </div>

      {/* Main Content Section */}
      <div className="w-[100%] max-w-lg bg-white rounded-lg shadow-lg p-6 mt-[60px] mb-[30px]">
        <h1 className="text-2xl text-black  font-bold text-center mb-6">Certificate Verification</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Field */}
          <input
            type="text"
            placeholder="Enter certificate number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full px-4 bg-white py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Certificate"}
          </button>

          {/* Error Message */}
          {error && <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>}

          {/* Result Section */}
          {result && (
            <div className="mt-6 border rounded-lg overflow-hidden">
              <div className={`p-4 ${result.isValid ? "bg-green-50" : "bg-red-50"}`}>
                <p className="text-lg font-semibold">
                  Status:{" "}
                  {result.isValid ? (
                    <span className="text-green-600">Valid Certificate</span>
                  ) : (
                    <span className="text-red-600">Invalid Certificate</span>
                  )}
                </p>
              </div>

              {result.isValid && result.certificateDetails && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <p className="text-gray-600">Certificate ID:</p>
                    <p className="col-span-2 font-medium">{result.certificateDetails.certificateId}</p>

                    <p className="text-gray-600">Holder Name:</p>
                    <p className="col-span-2 font-medium">{result.certificateDetails.holderName}</p>

                    <p className="text-gray-600">Category:</p>
                    <p className="col-span-2 font-medium">{result.certificateDetails.category}</p>

                    <p className="text-gray-600">School:</p>
                    <p className="col-span-2 font-medium">{result.certificateDetails.school}</p>

                    <p className="text-gray-600">Issue Date:</p>
                    <p className="col-span-2 font-medium">{result.certificateDetails.issueDate}</p>

                    <p className="text-gray-600">Status:</p>
                    <p className="col-span-2 font-medium">{result.certificateDetails.status}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Footer Section */}
      <footer className="w-full mt-auto text-center py-4 text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} myAImate Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
};

export default NumberVerificationForm;
