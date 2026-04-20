// --------------- TIPOS DO MÉTODO TOPSIS ---------------

export type CriterionType = 'benefit' | 'cost'; // benefício = maior é melhor | custo = menor é melhor

export interface Criterion {
  id: string;
  name: string;
  type: CriterionType;
  weight: number;   // peso normalizado (soma = 1)
  unit?: string;    // unidade de medida (opcional)
}

export interface Alternative {
  id: string;
  name: string;
  values: number[]; // valores para cada critério
}

export interface TopsisData {
  alternatives: Alternative[];
  criteria: Criterion[];
}

// --------------- RESULTADOS DO CÁLCULO ---------------

export interface TopsisResults {
  decisionMatrix: number[][];        // matriz original
  normalizedMatrix: number[][];      // após normalização vetorial
  weightedMatrix: number[][];        // após aplicação dos pesos
  idealPositive: number[];           // solução ideal positiva A+
  idealNegative: number[];           // solução ideal negativa A-
  distancePositive: number[];        // distância de cada alternativa a A+
  distanceNegative: number[];        // distância de cada alternativa a A-
  closenessCoefficient: number[];    // coeficiente de proximidade Ci
  ranking: { alternativeIndex: number; rank: number; ci: number }[];
}

export interface MethodologyStep {
  id: number;
  title: string;
  description: string;
  formula?: string;
  completed: boolean;
  active: boolean;
}
