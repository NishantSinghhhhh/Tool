// RankingContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types for the fetched data
interface Score {
  username: string;
  score: number;
  studentName: string;
  category: string;
}

interface BackendResponse {
  scores: Score[];
  userInfo: { username: string; student: string; setid: string }[];
}

interface SchoolRankingData {
  school: string;
  rank: number;
  averageMarks: number;
  section1Rank: number;
  section2Rank: number;
  section3Rank: number;
  category1Average: number;
  category1Section1Average: number;
  category1Section2Average: number;
  category1Section3Average: number;
  category2Average: number;
  category2Section1Average: number;
  category2Section2Average: number;
  category2Section3Average: number;
}

// Create the context interface
interface RankingContextType {
  schoolRanking: SchoolRankingData | null;
  fetchedData: BackendResponse | null;
  setSchoolRanking: React.Dispatch<React.SetStateAction<SchoolRankingData | null>>;
  setFetchedData: React.Dispatch<React.SetStateAction<BackendResponse | null>>;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  isFetching: boolean;
}

const RankingContext = createContext<RankingContextType | undefined>(undefined);

export const useRankingContext = () => {
  const context = useContext(RankingContext);
  if (!context) {
    throw new Error("useRankingContext must be used within a RankingProvider");
  }
  return context;
};

interface RankingProviderProps {
  children: ReactNode;
}

export const RankingProvider: React.FC<RankingProviderProps> = ({ children }) => {
  const [schoolRanking, setSchoolRanking] = useState<SchoolRankingData | null>(null);
  const [fetchedData, setFetchedData] = useState<BackendResponse | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  return (
    <RankingContext.Provider
      value={{ schoolRanking, fetchedData, setSchoolRanking, setFetchedData, setIsFetching, isFetching }}
    >
      {children}
    </RankingContext.Provider>
  );
};
