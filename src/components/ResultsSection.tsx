import { motion } from 'framer-motion';
import { TopsisData, TopsisResults } from '@/types/topsis';
import { FormulaDisplay } from './FormulaDisplay';
import { ArrowUp, ArrowDown, Trophy, Medal } from 'lucide-react';

// --------------- SEÇÃO DE RESULTADOS ---------------

interface ResultsSectionProps {
  data: TopsisData;
  results: TopsisResults;
}

export function ResultsSection({ data, results }: ResultsSectionProps) {

  // animação de entrada em cascata para os cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // ícone conforme posição no ranking
  const getRankingIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-ranking-gold" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-ranking-silver" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-ranking-bronze" />;
    return <span className="text-muted-foreground">{rank}º</span>;
  };

  // cor de fundo conforme posição no ranking
  const getRankingClass = (rank: number) => {
    if (rank === 1) return 'bg-ranking-gold/20 border-ranking-gold';
    if (rank === 2) return 'bg-ranking-silver/20 border-ranking-silver';
    if (rank === 3) return 'bg-ranking-bronze/20 border-ranking-bronze';
    return 'bg-muted/50 border-border';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >

      {/* etapa 1: matriz de decisão original */}
      <motion.div variants={itemVariants} className="academic-card">
        <div className="academic-card-header">
          <div className="flex items-center gap-3">
            <span className="step-indicator completed">1</span>
            <div>
              <h3 className="font-semibold">Matriz de Decisão Original</h3>
              <p className="text-sm text-muted-foreground">Dados brutos inseridos para análise</p>
            </div>
          </div>
        </div>
        <div className="academic-card-body overflow-x-auto">
          <table className="academic-table">
            <thead>
              <tr>
                <th>Alternativa</th>
                {data.criteria.map((c) => (
                  <th key={c.id}>
                    <div className="flex flex-col gap-1">
                      <span>{c.name}</span>
                      <span className={c.type === 'benefit' ? 'criterion-benefit' : 'criterion-cost'}>
                        {c.type === 'benefit'
                          ? <><ArrowUp className="w-3 h-3" /> Benefício</>
                          : <><ArrowDown className="w-3 h-3" /> Custo</>
                        }
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.alternatives.map((alt, i) => (
                <tr key={alt.id}>
                  <td className="font-medium">{alt.name}</td>
                  {results.decisionMatrix[i].map((val, j) => (
                    <td key={j} className="font-mono text-sm">{val.toFixed(4)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* etapa 2: normalização vetorial */}
      <motion.div variants={itemVariants} className="academic-card">
        <div className="academic-card-header">
          <div className="flex items-center gap-3">
            <span className="step-indicator completed">2</span>
            <div>
              <h3 className="font-semibold">Matriz Normalizada (Normalização Vetorial)</h3>
              <p className="text-sm text-muted-foreground">Normalização euclidiana dos valores</p>
            </div>
          </div>
        </div>
        <div className="academic-card-body space-y-4">
          <div className="methodology-box">
            <h4 className="text-sm font-semibold mb-2">Fórmula de Normalização Vetorial (Euclidiana):</h4>
            <FormulaDisplay formula="r_{ij} = \frac{x_{ij}}{\sqrt{\sum_{i=1}^{m} x_{ij}^2}}" />
            <p className="text-xs text-muted-foreground mt-2">
              Onde: r<sub>ij</sub> é o valor normalizado, x<sub>ij</sub> é o valor original,
              e m é o número de alternativas.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Alternativa</th>
                  {data.criteria.map((c) => <th key={c.id}>{c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.alternatives.map((alt, i) => (
                  <tr key={alt.id}>
                    <td className="font-medium">{alt.name}</td>
                    {results.normalizedMatrix[i].map((val, j) => (
                      <td key={j} className="font-mono text-sm">{val.toFixed(6)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* etapa 3: ponderação */}
      <motion.div variants={itemVariants} className="academic-card">
        <div className="academic-card-header">
          <div className="flex items-center gap-3">
            <span className="step-indicator completed">3</span>
            <div>
              <h3 className="font-semibold">Matriz Normalizada Ponderada</h3>
              <p className="text-sm text-muted-foreground">Aplicação dos pesos aos valores normalizados</p>
            </div>
          </div>
        </div>
        <div className="academic-card-body space-y-4">
          <div className="methodology-box">
            <h4 className="text-sm font-semibold mb-2">Fórmula de Ponderação:</h4>
            <FormulaDisplay formula="v_{ij} = w_j \times r_{ij}" />
            <p className="text-xs text-muted-foreground mt-2">
              Onde: v<sub>ij</sub> é o valor ponderado, w<sub>j</sub> é o peso do critério j,
              e r<sub>ij</sub> é o valor normalizado.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Alternativa</th>
                  {data.criteria.map((c) => (
                    <th key={c.id}>
                      <div className="flex flex-col gap-1">
                        <span>{c.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          w = {c.weight.toFixed(4)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.alternatives.map((alt, i) => (
                  <tr key={alt.id}>
                    <td className="font-medium">{alt.name}</td>
                    {results.weightedMatrix[i].map((val, j) => (
                      <td key={j} className="font-mono text-sm">{val.toFixed(6)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* etapa 4: soluções ideais A+ e A- */}
      <motion.div variants={itemVariants} className="academic-card">
        <div className="academic-card-header">
          <div className="flex items-center gap-3">
            <span className="step-indicator completed">4</span>
            <div>
              <h3 className="font-semibold">Soluções Ideais Positiva e Negativa</h3>
              <p className="text-sm text-muted-foreground">Identificação das soluções de referência</p>
            </div>
          </div>
        </div>
        <div className="academic-card-body space-y-4">
          <div className="methodology-box">
            <h4 className="text-sm font-semibold mb-2">Definição das Soluções Ideais:</h4>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm font-medium text-ideal-positive mb-1">Solução Ideal Positiva (A⁺):</p>
                <FormulaDisplay formula="A^+ = \{(\max_i v_{ij} | j \in J), (\min_i v_{ij} | j \in J')\}" className="text-sm" />
              </div>
              <div>
                <p className="text-sm font-medium text-ideal-negative mb-1">Solução Ideal Negativa (A⁻):</p>
                <FormulaDisplay formula="A^- = \{(\min_i v_{ij} | j \in J), (\max_i v_{ij} | j \in J')\}" className="text-sm" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Onde: J é o conjunto de critérios de benefício (quanto maior, melhor) e
              J' é o conjunto de critérios de custo (quanto menor, melhor).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Solução</th>
                  {data.criteria.map((c) => <th key={c.id}>{c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-ideal-positive/10">
                  <td className="font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-ideal-positive"></span>
                      A⁺ (Ideal Positiva)
                    </span>
                  </td>
                  {results.idealPositive.map((val, j) => (
                    <td key={j} className="font-mono text-sm">{val.toFixed(6)}</td>
                  ))}
                </tr>
                <tr className="bg-ideal-negative/10">
                  <td className="font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-ideal-negative"></span>
                      A⁻ (Ideal Negativa)
                    </span>
                  </td>
                  {results.idealNegative.map((val, j) => (
                    <td key={j} className="font-mono text-sm">{val.toFixed(6)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* etapa 5: distâncias euclidianas */}
      <motion.div variants={itemVariants} className="academic-card">
        <div className="academic-card-header">
          <div className="flex items-center gap-3">
            <span className="step-indicator completed">5</span>
            <div>
              <h3 className="font-semibold">Distâncias Euclidianas</h3>
              <p className="text-sm text-muted-foreground">Cálculo das distâncias às soluções ideais</p>
            </div>
          </div>
        </div>
        <div className="academic-card-body space-y-4">
          <div className="methodology-box">
            <h4 className="text-sm font-semibold mb-2">Fórmulas de Distância Euclidiana:</h4>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm font-medium mb-1">Distância à Solução Ideal Positiva:</p>
                <FormulaDisplay formula="D_i^+ = \sqrt{\sum_{j=1}^{n}(v_{ij} - v_j^+)^2}" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Distância à Solução Ideal Negativa:</p>
                <FormulaDisplay formula="D_i^- = \sqrt{\sum_{j=1}^{n}(v_{ij} - v_j^-)^2}" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Alternativa</th>
                  <th>D⁺ (Dist. Ideal Positiva)</th>
                  <th>D⁻ (Dist. Ideal Negativa)</th>
                </tr>
              </thead>
              <tbody>
                {data.alternatives.map((alt, i) => (
                  <tr key={alt.id}>
                    <td className="font-medium">{alt.name}</td>
                    <td className="font-mono text-sm">{results.distancePositive[i].toFixed(6)}</td>
                    <td className="font-mono text-sm">{results.distanceNegative[i].toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* etapa 6: coeficiente de proximidade Ci */}
      <motion.div variants={itemVariants} className="academic-card">
        <div className="academic-card-header">
          <div className="flex items-center gap-3">
            <span className="step-indicator completed">6</span>
            <div>
              <h3 className="font-semibold">Coeficiente de Proximidade Relativa (Cᵢ)</h3>
              <p className="text-sm text-muted-foreground">Índice de desempenho final de cada alternativa</p>
            </div>
          </div>
        </div>
        <div className="academic-card-body space-y-4">
          <div className="methodology-box">
            <h4 className="text-sm font-semibold mb-2">Fórmula do Coeficiente de Proximidade:</h4>
            <FormulaDisplay formula="C_i = \frac{D_i^-}{D_i^+ + D_i^-}" />
            <p className="text-xs text-muted-foreground mt-2">
              Onde: C<sub>i</sub> varia de 0 a 1. Quanto mais próximo de 1, melhor o desempenho
              da alternativa (mais próxima da solução ideal positiva).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Alternativa</th>
                  <th>D⁺</th>
                  <th>D⁻</th>
                  <th>Cᵢ</th>
                </tr>
              </thead>
              <tbody>
                {data.alternatives.map((alt, i) => (
                  <tr key={alt.id}>
                    <td className="font-medium">{alt.name}</td>
                    <td className="font-mono text-sm">{results.distancePositive[i].toFixed(6)}</td>
                    <td className="font-mono text-sm">{results.distanceNegative[i].toFixed(6)}</td>
                    <td className="font-mono text-sm font-semibold">{results.closenessCoefficient[i].toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* etapa 7: ranking final */}
      <motion.div variants={itemVariants} className="academic-card">
        <div className="academic-card-header">
          <div className="flex items-center gap-3">
            <span className="step-indicator completed">7</span>
            <div>
              <h3 className="font-semibold">Ranking Final</h3>
              <p className="text-sm text-muted-foreground">Ordenação das alternativas por desempenho</p>
            </div>
          </div>
        </div>
        <div className="academic-card-body">
          <div className="grid gap-3">
            {results.ranking.map((r) => {
              const alt = data.alternatives[r.alternativeIndex];
              return (
                <motion.div
                  key={r.alternativeIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: r.rank * 0.1 }} // animação escalonada pelo rank
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 ${getRankingClass(r.rank)}`}
                >
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankingIcon(r.rank)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{alt.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Coeficiente de proximidade: <span className="font-mono font-medium">{r.ci.toFixed(6)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{r.rank}º</span>
                    <p className="text-xs text-muted-foreground">lugar</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
