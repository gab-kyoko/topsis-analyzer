import { useEffect, useRef } from 'react';
import katex from 'katex';

// --------------- COMPONENTE DE FÓRMULAS MATEMÁTICAS ---------------

interface FormulaDisplayProps {
  formula: string;
  displayMode?: boolean; // true = bloco centralizado | false = inline
  className?: string;
}

// renderiza fórmulas LaTeX usando KaTeX
export function FormulaDisplay({ formula, displayMode = true, className = '' }: FormulaDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          displayMode,
          throwOnError: false,
          strict: false,
        });
      } catch (error) {
        console.error('Erro ao renderizar fórmula KaTeX:', error);
        if (containerRef.current) {
          containerRef.current.textContent = formula; // fallback: exibe o texto cru
        }
      }
    }
  }, [formula, displayMode]);

  return (
    <div
      ref={containerRef}
      className={`formula-block ${className}`}
    />
  );
}

// versão inline da fórmula (para usar dentro de parágrafos)
export function InlineFormula({ formula, className = '' }: { formula: string; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          displayMode: false,
          throwOnError: false,
          strict: false,
        });
      } catch (error) {
        console.error('Erro ao renderizar fórmula inline KaTeX:', error);
        if (containerRef.current) {
          containerRef.current.textContent = formula;
        }
      }
    }
  }, [formula]);

  return <span ref={containerRef} className={`formula-inline ${className}`} />;
}
