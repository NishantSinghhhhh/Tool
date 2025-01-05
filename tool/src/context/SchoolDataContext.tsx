import { createContext, useState, ReactNode } from 'react';
import { BackendResponse, UserInfo, UserScore } from '../types/types'; // Adjust path as needed

interface DataContextType {
  userInfo: UserInfo[];
  scores: UserScore[];
  fetchDetails: (schoolName: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo[]>([]);
  const [scores, setScores] = useState<UserScore[]>([]);

  const fetchDetails = async (schoolName: string) => {
    if (!schoolName.trim()) {
      alert('School name is not valid.');
      return;
    }

    try {
      const response = await fetch('http://localhost:7009/result/schoolName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: schoolName }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch school details');
      }

      const data: BackendResponse = await response.json();

      setUserInfo(data.userInfo);
      setScores(data.scores);
    } catch (error) {
      console.error('Error fetching school details:', error);
    }
  };

  return (
    <DataContext.Provider value={{ userInfo, scores, fetchDetails }}>
      {children}
    </DataContext.Provider>
  );
};
