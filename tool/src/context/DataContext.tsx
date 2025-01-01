import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TableData {
  scores: Array<[string, number]>;
  userInfo: Array<{
    username: string;
    student: string;
    schoolName: string;
    category: string;
  }>;
}

interface DataContextType {
  tableData: TableData | null;
  setTableData: React.Dispatch<React.SetStateAction<TableData | null>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Correctly typed DataProvider component
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [tableData, setTableData] = useState<TableData | null>(null);

  return (
    <DataContext.Provider value={{ tableData, setTableData }}>
      {children}
    </DataContext.Provider>
  );
};
