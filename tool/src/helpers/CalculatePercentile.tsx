export const calculatePercentile = (frequencyData: Record<string, number>, score: number): number => {
    const marksArray = Object.entries(frequencyData)
      .map(([key, value]) => ({
        marks: parseInt(key, 10),
        frequency: value,
      }))
      .sort((a, b) => a.marks - b.marks); // Sort in ascending order

    const totalStudents = marksArray.reduce((acc, curr) => acc + curr.frequency, 0);
    let cumulativeFreq = 0;

    const percentile = marksArray.reduce((acc, curr) => {
      cumulativeFreq += curr.frequency;
      if (curr.marks === score) {
        acc = ((cumulativeFreq - curr.frequency / 2) / totalStudents) * 100;
      }
      return acc;
    }, 0);

    return percentile;
  };
  