import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

interface UserScore {
  username: string;
  totalMarks: number;
  section1Marks: number;
  section2Marks: number;
  section3Marks: number;
  category: string;
  studentName: string;
}

interface UserInfo {
  username: string;
  student: string;
  setid: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  table: {
    display: "flex",
    flexDirection: "column",
  },
  tableHeader: {
    fontWeight: "bold",
    flexDirection: "row",
    marginBottom: 5,
    borderBottom: "1px solid black",
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  tableCell: {
    flex: 1,
    padding: 5,
  },
});

const PDFDocument = ({ schoolName, scores }: { schoolName: string; scores: UserScore[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Detailed Results - {schoolName}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCell}>Username</Text>
          <Text style={styles.tableCell}>Student Name</Text>
          <Text style={styles.tableCell}>Total Marks</Text>
          <Text style={styles.tableCell}>Section 1</Text>
          <Text style={styles.tableCell}>Section 2</Text>
          <Text style={styles.tableCell}>Section 3</Text>
          <Text style={styles.tableCell}>Category</Text>
        </View>
        {scores.map((score, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{score.username}</Text>
            <Text style={styles.tableCell}>{score.studentName}</Text>
            <Text style={styles.tableCell}>{score.totalMarks}</Text>
            <Text style={styles.tableCell}>{score.section1Marks}</Text>
            <Text style={styles.tableCell}>{score.section2Marks}</Text>
            <Text style={styles.tableCell}>{score.section3Marks}</Text>
            <Text style={styles.tableCell}>{score.category}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

interface PDFDownloadProps {
  schoolName: string;
  scores: UserScore[];
}

const PDFDownload: React.FC<PDFDownloadProps> = ({ schoolName, scores }) => (
  <div className="text-center mt-6">
    <PDFDownloadLink
      document={<PDFDocument schoolName={schoolName} scores={scores} />}
      fileName={`${schoolName}_DetailedResults.pdf`}
      className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600"
    >
        Download
    </PDFDownloadLink>
  </div>
);

export default PDFDownload;