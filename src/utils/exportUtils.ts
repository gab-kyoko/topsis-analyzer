import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TopsisData, TopsisResults } from '@/types/topsis';

// --------------- EXPORTAÇÃO PARA EXCEL ---------------

export function exportToExcel(data: TopsisData, results: TopsisResults) {
  const workbook = XLSX.utils.book_new();

  // aba 1: matriz de decisão original
  const decisionHeaders = ['Alternativa', ...data.criteria.map(c => c.name)];
  const decisionData = data.alternatives.map((alt, i) => [
    alt.name,
    ...results.decisionMatrix[i].map(v => v.toFixed(4)),
  ]);
  const decisionSheet = XLSX.utils.aoa_to_sheet([decisionHeaders, ...decisionData]);
  XLSX.utils.book_append_sheet(workbook, decisionSheet, 'Matriz de Decisão');

  // aba 2: matriz normalizada
  const normalizedData = data.alternatives.map((alt, i) => [
    alt.name,
    ...results.normalizedMatrix[i].map(v => v.toFixed(6)),
  ]);
  const normalizedSheet = XLSX.utils.aoa_to_sheet([decisionHeaders, ...normalizedData]);
  XLSX.utils.book_append_sheet(workbook, normalizedSheet, 'Matriz Normalizada');

  // aba 3: matriz ponderada
  const weightedData = data.alternatives.map((alt, i) => [
    alt.name,
    ...results.weightedMatrix[i].map(v => v.toFixed(6)),
  ]);
  const weightedSheet = XLSX.utils.aoa_to_sheet([decisionHeaders, ...weightedData]);
  XLSX.utils.book_append_sheet(workbook, weightedSheet, 'Matriz Ponderada');

  // aba 4: soluções ideais A+ e A-
  const idealHeaders = ['Solução', ...data.criteria.map(c => c.name)];
  const idealData = [
    ['A+ (Ideal Positiva)', ...results.idealPositive.map(v => v.toFixed(6))],
    ['A- (Ideal Negativa)', ...results.idealNegative.map(v => v.toFixed(6))],
  ];
  const idealSheet = XLSX.utils.aoa_to_sheet([idealHeaders, ...idealData]);
  XLSX.utils.book_append_sheet(workbook, idealSheet, 'Soluções Ideais');

  // aba 5: distâncias e coeficiente Ci com ranking
  const distanceHeaders = ['Alternativa', 'D+', 'D-', 'Ci', 'Ranking'];
  const distanceData = results.ranking.map(r => {
    const alt = data.alternatives[r.alternativeIndex];
    return [
      alt.name,
      results.distancePositive[r.alternativeIndex].toFixed(6),
      results.distanceNegative[r.alternativeIndex].toFixed(6),
      r.ci.toFixed(6),
      r.rank.toString(),
    ];
  });
  const distanceSheet = XLSX.utils.aoa_to_sheet([distanceHeaders, ...distanceData]);
  XLSX.utils.book_append_sheet(workbook, distanceSheet, 'Resultados');

  // aba 6: informações dos critérios
  const criteriaHeaders = ['Critério', 'Tipo', 'Peso', 'Unidade'];
  const criteriaData = data.criteria.map(c => [
    c.name,
    c.type === 'benefit' ? 'Benefício' : 'Custo',
    c.weight.toFixed(4),
    c.unit || '-',
  ]);
  const criteriaSheet = XLSX.utils.aoa_to_sheet([criteriaHeaders, ...criteriaData]);
  XLSX.utils.book_append_sheet(workbook, criteriaSheet, 'Critérios');

  XLSX.writeFile(workbook, 'analise_topsis.xlsx'); // faz o download do arquivo
}

// --------------- EXPORTAÇÃO PARA PDF ---------------

export function exportToPDF(data: TopsisData, results: TopsisResults) {
  const doc = new jsPDF();
  let yPos = 20;

  // cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise Multicritério - Método TOPSIS', 105, yPos, { align: 'center' });
  yPos += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, yPos, { align: 'center' });
  yPos += 15;

  // seção 1: critérios
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Critérios de Avaliação', 14, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Critério', 'Tipo', 'Peso']],
    body: data.criteria.map(c => [
      c.name,
      c.type === 'benefit' ? 'Benefício (+)' : 'Custo (-)',
      c.weight.toFixed(4),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95] },
    styles: { fontSize: 9 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // seção 2: matriz de decisão
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Matriz de Decisão Original', 14, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Alternativa', ...data.criteria.map(c => c.name)]],
    body: data.alternatives.map((alt, i) => [
      alt.name,
      ...results.decisionMatrix[i].map(v => v.toFixed(4)),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95] },
    styles: { fontSize: 8 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;
  if (yPos > 250) { doc.addPage(); yPos = 20; } // nova página se necessário

  // seção 3: matriz normalizada
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Matriz Normalizada (Método Euclidiano)', 14, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Alternativa', ...data.criteria.map(c => c.name)]],
    body: data.alternatives.map((alt, i) => [
      alt.name,
      ...results.normalizedMatrix[i].map(v => v.toFixed(6)),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95] },
    styles: { fontSize: 8 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;
  if (yPos > 250) { doc.addPage(); yPos = 20; }

  // seção 4: soluções ideais
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Soluções Ideais', 14, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Solução', ...data.criteria.map(c => c.name)]],
    body: [
      ['A+ (Positiva)', ...results.idealPositive.map(v => v.toFixed(6))],
      ['A- (Negativa)', ...results.idealNegative.map(v => v.toFixed(6))],
    ],
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95] },
    styles: { fontSize: 8 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;
  if (yPos > 200) { doc.addPage(); yPos = 20; }

  // seção 5: resultados finais com ranking
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Resultados Finais', 14, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    head: [['Ranking', 'Alternativa', 'D⁺', 'D⁻', 'Cᵢ']],
    body: results.ranking.map(r => {
      const alt = data.alternatives[r.alternativeIndex];
      return [
        `${r.rank}º`,
        alt.name,
        results.distancePositive[r.alternativeIndex].toFixed(6),
        results.distanceNegative[r.alternativeIndex].toFixed(6),
        r.ci.toFixed(6),
      ];
    }),
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95] },
    styles: { fontSize: 9 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;
  if (yPos > 250) { doc.addPage(); yPos = 20; }

  // nota metodológica ao final
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const methodNote =
    'Nota metodológica: Análise realizada utilizando o método TOPSIS (Technique for Order Preference by Similarity to Ideal Solution), com normalização vetorial euclidiana. O coeficiente Cᵢ representa a proximidade relativa de cada alternativa à solução ideal positiva, variando de 0 a 1, onde valores maiores indicam melhor desempenho.';
  const splitNote = doc.splitTextToSize(methodNote, 180);
  doc.text(splitNote, 14, yPos);

  doc.save('analise_topsis.pdf'); // faz o download do arquivo
}
