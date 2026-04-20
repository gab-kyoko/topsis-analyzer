import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TopsisData, TopsisResults } from '@/types/topsis';

// --------------- VISUALIZAÇÃO EM GRÁFICOS ---------------

interface ChartsVisualizationProps {
  data: TopsisData;
  results: TopsisResults;
}

export function ChartsVisualization({ data, results }: ChartsVisualizationProps) {

  // dados para o gráfico de barras do ranking (Ci por alternativa)
  const rankingChartData = results.ranking.map((r) => ({
    name: data.alternatives[r.alternativeIndex].name,
    ci: parseFloat(r.ci.toFixed(4)),
    rank: r.rank,
  }));

  // dados para o gráfico de distâncias D+ vs D-
  const distancesData = data.alternatives.map((alt, i) => ({
    name: alt.name,
    'D⁺': parseFloat(results.distancePositive[i].toFixed(4)),
    'D⁻': parseFloat(results.distanceNegative[i].toFixed(4)),
  }));

  // dados para o gráfico radar (valores normalizados por critério)
  const radarData = data.criteria.map((criterion, j) => {
    const point: any = { criterion: criterion.name };
    data.alternatives.forEach((alt, i) => {
      point[alt.name] = parseFloat(results.normalizedMatrix[i][j].toFixed(4));
    });
    return point;
  });

  // paleta de cores para as alternativas no radar
  const colors = [
    'hsl(185, 60%, 40%)',
    'hsl(220, 60%, 45%)',
    'hsl(160, 60%, 40%)',
    'hsl(25, 85%, 55%)',
    'hsl(280, 50%, 50%)',
    'hsl(45, 90%, 50%)',
    'hsl(0, 65%, 50%)',
    'hsl(120, 50%, 45%)',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* gráfico 1: ranking pelo coeficiente Ci (barras horizontais) */}
      <div className="academic-card">
        <div className="academic-card-header">
          <h3 className="font-semibold">Gráfico de Ranking - Coeficiente de Proximidade (Cᵢ)</h3>
          <p className="text-sm text-muted-foreground">Visualização comparativa do desempenho das alternativas</p>
        </div>
        <div className="academic-card-body">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={rankingChartData} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                domain={[0, 1]}
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [value.toFixed(4), 'Cᵢ']}
              />
              <Legend />
              <Bar
                dataKey="ci"
                fill="hsl(185, 60%, 40%)"
                name="Coeficiente Cᵢ"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* gráfico 2: comparação entre D+ e D- por alternativa */}
      <div className="academic-card">
        <div className="academic-card-header">
          <h3 className="font-semibold">Distâncias às Soluções Ideais</h3>
          <p className="text-sm text-muted-foreground">Comparação entre D⁺ e D⁻ para cada alternativa</p>
        </div>
        <div className="academic-card-body">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={distancesData} margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => value.toFixed(4)}
              />
              <Legend />
              <Bar dataKey="D⁺" fill="hsl(160, 65%, 45%)" name="D⁺ (Distância Ideal Positiva)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="D⁻" fill="hsl(0, 65%, 50%)"   name="D⁻ (Distância Ideal Negativa)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* gráfico 3: radar com valores normalizados por critério */}
      <div className="academic-card">
        <div className="academic-card-header">
          <h3 className="font-semibold">Perfil Comparativo das Alternativas</h3>
          <p className="text-sm text-muted-foreground">Valores normalizados por critério</p>
        </div>
        <div className="academic-card-body">
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="criterion"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 1]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              {data.alternatives.map((alt, i) => (
                <Radar
                  key={alt.id}
                  name={alt.name}
                  dataKey={alt.name}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => value.toFixed(4)}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
