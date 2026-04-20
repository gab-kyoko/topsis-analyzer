import { Check } from 'lucide-react';

// --------------- INDICADOR DE ETAPAS METODOLÓGICAS ---------------

interface MethodologyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

interface StepIndicatorProps {
  steps: MethodologyStep[];
  currentStep: number;
}

// barra lateral com as 7 etapas do TOPSIS (visível apenas em telas grandes)
export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-4">
        <div className="academic-card p-4">
          <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">
            Etapas Metodológicas
          </h3>
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                  step.active
                    ? 'bg-accent/10'
                    : step.completed
                    ? 'bg-benefit/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                {/* ícone da etapa: check se concluída, número caso contrário */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step.completed
                      ? 'bg-benefit text-white'
                      : step.active
                      ? 'bg-accent text-accent-foreground ring-2 ring-accent/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.completed ? <Check className="w-3 h-3" /> : step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      step.completed || step.active ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------- ETAPAS PADRÃO DO MÉTODO TOPSIS ---------------

export const methodologySteps: MethodologyStep[] = [
  { id: 1, title: 'Matriz de Decisão',  description: 'Construção da matriz com alternativas e critérios', completed: false, active: false },
  { id: 2, title: 'Normalização',       description: 'Normalização vetorial (euclidiana)',                completed: false, active: false },
  { id: 3, title: 'Ponderação',         description: 'Aplicação dos pesos aos critérios',                completed: false, active: false },
  { id: 4, title: 'Soluções Ideais',    description: 'Identificação de A⁺ e A⁻',                        completed: false, active: false },
  { id: 5, title: 'Distâncias',         description: 'Cálculo das distâncias euclidianas',               completed: false, active: false },
  { id: 6, title: 'Coeficiente Cᵢ',    description: 'Proximidade relativa',                              completed: false, active: false },
  { id: 7, title: 'Ranking Final',      description: 'Ordenação das alternativas',                       completed: false, active: false },
];
