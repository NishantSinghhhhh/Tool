// Define the interface for UserScore
export interface UserScore {
    username: string;
    totalMarks: number;
    section1Marks: number;
    section2Marks: number;
    section3Marks: number;
    category: string;
    studentName: string;
  }
  
  // Define the interface for UserInfo
  export interface UserInfo {
    username: string;
    student: string;
    setid: string;
  }
  
  // Define the interface for BackendResponse
  export interface BackendResponse {
    success: boolean;
    message: string;
    userInfo: UserInfo[];
    scores: UserScore[];
  }
  
  // Define the interface for SchoolRankingData
  export interface SchoolRankingData {
    school: string;
    averageMarks: number;
    section1Average: number;
    section2Average: number;
    section3Average: number;
    category1Average: number;
    category1Section1Average: number;
    category1Section2Average: number;
    category1Section3Average: number;
    category2Average: number;
    category2Section1Average: number;
    category2Section2Average: number;
    category2Section3Average: number;
    rank: number;
    section1Rank: number;
    section2Rank: number;
    section3Rank: number;
    category1Section1Rank: number;
    category1Section2Rank: number;
    category1Section3Rank: number;
    category2Section1Rank: number;
    category2Section2Rank: number;
    category2Section3Rank: number;
  }
  
  export interface UserInfo {
    _id: {
      $oid: string;
    };
    username: string;
    password: string;
    setid: string;
    schoolName: string;
    student: string;
    category: string;
    timeLeft: number;
    submitted: number;
    __v: number;
  }
  
  export interface UserScore {
    username: string;
    section1Marks: number;
    section2Marks: number;
    section3Marks: number;
    totalMarks: number;
  }
  
  export interface BackendResponse {
    success: boolean;
    message: string;
    userInfo: UserInfo[]; // Array of user objects
    scores: UserScore[]; // Array of scores
  }
  
  export interface DataContextType {
    userInfo: UserInfo[];
    scores: UserScore[];
    schoolRankingData: SchoolRankingData[];
    schoolRanking: SchoolRankingData | null;
    isFetching: boolean;
    setUserInfo: React.Dispatch<React.SetStateAction<UserInfo[]>>;
    setScores: React.Dispatch<React.SetStateAction<UserScore[]>>;
    setSchoolRanking: React.Dispatch<React.SetStateAction<SchoolRankingData | null>>;
    setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  }
  