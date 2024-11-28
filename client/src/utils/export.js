import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const formatQuestionnaireData = (questionnaire, statistics) => {
  const rows = [];

  // Summary data
  rows.push({
    'Questionnaire Title': questionnaire.title,
    'Total Responses': statistics.totalResponses,
    'Status': questionnaire.status
  });

  rows.push({}); // Empty row for spacing

  // Brand ratings
  rows.push({ 'Brand Ratings': '' });
  questionnaire.brands.forEach(brand => {
    const brandStats = statistics.brandRatings[brand._id];
    if (brandStats) {
      rows.push({
        'Brand': brand.name,
        'Average Rating': brandStats.averageScore,
        'Times Preferred': statistics.brandPreferences[brand._id] || 0
      });

      // Criteria breakdown
      Object.entries(brandStats.criteriaScores).forEach(([criterion, score]) => {
        rows.push({
          'Criterion': criterion,
          'Score': score
        });
      });
      rows.push({}); // Spacing
    }
  });

  return rows;
}; 