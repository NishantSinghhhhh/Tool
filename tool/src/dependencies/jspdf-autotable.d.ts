import "jspdf";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: {
      finalY: number; // Position of the last table
    };
  }
}
