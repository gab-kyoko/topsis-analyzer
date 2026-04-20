import { TopsisData, TopsisResults, Criterion } from '@/types/topsis';

// --------------- NORMALIZAÇÃO DA MATRIZ ---------------

// normaliza pelo método vetorial euclidiano: r_ij = x_ij / sqrt(sum(x_ij²))
export function normalizeMatrix(matrix: number[][]): number[][] {
  const numAlternatives = matrix.length;
  const numCriteria = matrix[0]?.length || 0;

  const normalized: number[][] = [];

  // calcula a norma euclidiana de cada coluna (critério)
  const norms: number[] = [];
  for (let j = 0; j < numCriteria; j++) {
    let sumSquares = 0;
    for (let i = 0; i < numAlternatives; i++) {
      sumSquares += Math.pow(matrix[i][j], 2);
    }
    norms.push(Math.sqrt(sumSquares));
  }

  // divide cada elemento pela norma da sua coluna
  for (let i = 0; i < numAlternatives; i++) {
    const row: number[] = [];
    for (let j = 0; j < numCriteria; j++) {
      const norm = norms[j];
      row.push(norm === 0 ? 0 : matrix[i][j] / norm); // evita divisão por zero
    }
    normalized.push(row);
  }

  return normalized;
}

// --------------- APLICAÇÃO DOS PESOS ---------------

// v_ij = w_j * r_ij
export function applyWeights(normalizedMatrix: number[][], weights: number[]): number[][] {
  return normalizedMatrix.map(row =>
    row.map((value, j) => value * weights[j])
  );
}

// --------------- SOLUÇÃO IDEAL POSITIVA (A+) ---------------

// benefício → maior valor | custo → menor valor
export function calculateIdealPositive(weightedMatrix: number[][], criteria: Criterion[]): number[] {
  const numCriteria = criteria.length;
  const ideal: number[] = [];

  for (let j = 0; j < numCriteria; j++) {
    const columnValues = weightedMatrix.map(row => row[j]);
    if (criteria[j].type === 'benefit') {
      ideal.push(Math.max(...columnValues));
    } else {
      ideal.push(Math.min(...columnValues));
    }
  }

  return ideal;
}

// --------------- SOLUÇÃO IDEAL NEGATIVA (A-) ---------------

// benefício → menor valor | custo → maior valor (inverso da positiva)
export function calculateIdealNegative(weightedMatrix: number[][], criteria: Criterion[]): number[] {
  const numCriteria = criteria.length;
  const ideal: number[] = [];

  for (let j = 0; j < numCriteria; j++) {
    const columnValues = weightedMatrix.map(row => row[j]);
    if (criteria[j].type === 'benefit') {
      ideal.push(Math.min(...columnValues));
    } else {
      ideal.push(Math.max(...columnValues));
    }
  }

  return ideal;
}

// --------------- DISTÂNCIAS EUCLIDIANAS ---------------

// D_i+ = sqrt(sum((v_ij - v_j+)²))
export function calculateDistancePositive(weightedMatrix: number[][], idealPositive: number[]): number[] {
  return weightedMatrix.map(row => {
    const sumSquares = row.reduce((sum, value, j) => {
      return sum + Math.pow(value - idealPositive[j], 2);
    }, 0);
    return Math.sqrt(sumSquares);
  });
}

// D_i- = sqrt(sum((v_ij - v_j-)²))
export function calculateDistanceNegative(weightedMatrix: number[][], idealNegative: number[]): number[] {
  return weightedMatrix.map(row => {
    const sumSquares = row.reduce((sum, value, j) => {
      return sum + Math.pow(value - idealNegative[j], 2);
    }, 0);
    return Math.sqrt(sumSquares);
  });
}

// --------------- COEFICIENTE DE PROXIMIDADE ---------------

// C_i = D_i- / (D_i+ + D_i-)  →  varia de 0 a 1, quanto maior melhor
export function calculateClosenessCoefficient(distancePositive: number[], distanceNegative: number[]): number[] {
  return distancePositive.map((dPlus, i) => {
    const dMinus = distanceNegative[i];
    const denominator = dPlus + dMinus;
    return denominator === 0 ? 0 : dMinus / denominator; // evita divisão por zero
  });
}

// --------------- RANKING FINAL ---------------

// ordena por Ci decrescente e atribui posições
export function generateRanking(closenessCoefficient: number[]): { alternativeIndex: number; rank: number; ci: number }[] {
  const indexed = closenessCoefficient.map((ci, index) => ({
    alternativeIndex: index,
    ci,
    rank: 0,
  }));

  indexed.sort((a, b) => b.ci - a.ci); // maior Ci = melhor posição

  indexed.forEach((item, index) => {
    item.rank = index + 1;
  });

  return indexed;
}

// --------------- ANÁLISE TOPSIS COMPLETA ---------------

// executa todos os passos do método em sequência
export function performTopsisAnalysis(data: TopsisData): TopsisResults {
  const decisionMatrix = data.alternatives.map(alt => [...alt.values]); // passo 1: matriz de decisão
  const normalizedMatrix = normalizeMatrix(decisionMatrix);              // passo 2: normalização
  const weights = data.criteria.map(c => c.weight);
  const weightedMatrix = applyWeights(normalizedMatrix, weights);        // passo 3: ponderação
  const idealPositive = calculateIdealPositive(weightedMatrix, data.criteria); // passo 4: A+
  const idealNegative = calculateIdealNegative(weightedMatrix, data.criteria); // passo 5: A-
  const distancePositive = calculateDistancePositive(weightedMatrix, idealPositive); // passo 6: D+
  const distanceNegative = calculateDistanceNegative(weightedMatrix, idealNegative); // passo 6: D-
  const closenessCoefficient = calculateClosenessCoefficient(distancePositive, distanceNegative); // passo 7: Ci
  const ranking = generateRanking(closenessCoefficient);                 // passo 8: ranking

  return {
    decisionMatrix,
    normalizedMatrix,
    weightedMatrix,
    idealPositive,
    idealNegative,
    distancePositive,
    distanceNegative,
    closenessCoefficient,
    ranking,
  };
}

// --------------- UTILITÁRIOS DE PESO ---------------

// verifica se a soma dos pesos é aproximadamente 1
export function validateWeights(weights: number[]): boolean {
  const sum = weights.reduce((acc, w) => acc + w, 0);
  return Math.abs(sum - 1) < 0.0001;
}

// normaliza os pesos para que somem 1
export function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((acc, w) => acc + w, 0);
  if (sum === 0) return weights.map(() => 1 / weights.length); // distribui igualmente se todos forem zero
  return weights.map(w => w / sum);
}
