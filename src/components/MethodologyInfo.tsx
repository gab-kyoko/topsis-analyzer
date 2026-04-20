import { motion } from 'framer-motion';
import { FormulaDisplay } from './FormulaDisplay';
import { BookOpen, Target, Scale, TrendingUp } from 'lucide-react';

// --------------- ABA DE METODOLOGIA ---------------

// exibe a fundamentação teórica e matemática do método TOPSIS
export function MethodologyInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* introdução ao método */}
      <div className="academic-card">
        <div className="academic-card-header">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Sobre o Método TOPSIS</h3>
          </div>
        </div>
        <div className="academic-card-body prose prose-sm max-w-none">
          <p className="text-muted-foreground">
            O <strong>TOPSIS</strong> (Technique for Order Preference by Similarity to Ideal Solution)
            é um método de análise multicritério desenvolvido por Hwang e Yoon (1981). Fundamenta-se
            no princípio de que a melhor alternativa deve ter a menor distância da solução ideal
            positiva e a maior distância da solução ideal negativa.
          </p>
          <p className="text-muted-foreground mt-3">
            Este método é amplamente utilizado em pesquisas de pós-graduação devido à sua
            transparência metodológica, fundamentação matemática sólida e capacidade de
            lidar com múltiplos critérios de diferentes naturezas (benefício e custo).
          </p>
        </div>
      </div>

      {/* três conceitos-chave em cards lado a lado */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="academic-card">
          <div className="academic-card-body text-center">
            <Target className="w-8 h-8 text-ideal-positive mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Solução Ideal Positiva (A⁺)</h4>
            <p className="text-sm text-muted-foreground">
              Combinação hipotética dos melhores valores para cada critério,
              considerando sua natureza (benefício ou custo).
            </p>
          </div>
        </div>
        <div className="academic-card">
          <div className="academic-card-body text-center">
            <Target className="w-8 h-8 text-ideal-negative mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Solução Ideal Negativa (A⁻)</h4>
            <p className="text-sm text-muted-foreground">
              Combinação hipotética dos piores valores para cada critério,
              servindo como referência para evitar.
            </p>
          </div>
        </div>
        <div className="academic-card">
          <div className="academic-card-body text-center">
            <Scale className="w-8 h-8 text-accent mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Coeficiente Cᵢ</h4>
            <p className="text-sm text-muted-foreground">
              Índice de 0 a 1 que representa a proximidade relativa de cada
              alternativa à solução ideal positiva.
            </p>
          </div>
        </div>
      </div>

      {/* fórmulas matemáticas de cada etapa */}
      <div className="academic-card">
        <div className="academic-card-header">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Fundamentação Matemática</h3>
          </div>
        </div>
        <div className="academic-card-body space-y-6">
          <div>
            <h4 className="font-medium mb-2">1. Normalização Vetorial (Euclidiana)</h4>
            <FormulaDisplay formula="r_{ij} = \frac{x_{ij}}{\sqrt{\sum_{i=1}^{m} x_{ij}^2}}" />
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Matriz Ponderada</h4>
            <FormulaDisplay formula="v_{ij} = w_j \times r_{ij}, \quad \text{onde} \quad \sum_{j=1}^{n} w_j = 1" />
          </div>
          <div>
            <h4 className="font-medium mb-2">3. Distância Euclidiana</h4>
            <FormulaDisplay formula="D_i^+ = \sqrt{\sum_{j=1}^{n}(v_{ij} - v_j^+)^2} \quad \text{e} \quad D_i^- = \sqrt{\sum_{j=1}^{n}(v_{ij} - v_j^-)^2}" />
          </div>
          <div>
            <h4 className="font-medium mb-2">4. Coeficiente de Proximidade Relativa</h4>
            <FormulaDisplay formula="C_i = \frac{D_i^-}{D_i^+ + D_i^-}, \quad 0 \leq C_i \leq 1" />
          </div>
        </div>
      </div>

      {/* referências bibliográficas */}
      <div className="academic-card">
        <div className="academic-card-header">
          <h3 className="font-semibold">Referências Bibliográficas</h3>
        </div>
        <div className="academic-card-body">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              HWANG, C. L.; YOON, K. <em>Multiple Attribute Decision Making: Methods and Applications</em>.
              Springer-Verlag, Berlin, 1981.
            </li>
            <li>
              BEHZADIAN, M. et al. A state-of the-art survey of TOPSIS applications.
              <em>Expert Systems with Applications</em>, v. 39, n. 17, p. 13051-13069, 2012.
            </li>
            <li>
              YOON, K. P.; HWANG, C. L. <em>Multiple Attribute Decision Making: An Introduction</em>.
              Sage Publications, Thousand Oaks, 1995.
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
