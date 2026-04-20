import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  FileSpreadsheet,
  BarChart3,
  BookOpen,
  Download,
  FileDown,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataInputSection } from '@/components/DataInputSection';
import { ResultsSection } from '@/components/ResultsSection';
import { ChartsVisualization } from '@/components/ChartsVisualization';
import { MethodologyInfo } from '@/components/MethodologyInfo';
import { StepIndicator, methodologySteps } from '@/components/StepIndicator';
import { TopsisData, TopsisResults } from '@/types/topsis';
import { performTopsisAnalysis } from '@/utils/topsisCalculations';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

// --------------- PÁGINA PRINCIPAL ---------------

const Index = () => {
  const [data, setData] = useState<TopsisData | null>(null);           // dados de entrada
  const [results, setResults] = useState<TopsisResults | null>(null);  // resultados calculados
  const [activeTab, setActiveTab] = useState('input');                 // aba ativa
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);         // menu mobile aberto/fechado

  // recebe os dados do formulário, executa o TOPSIS e navega para os resultados
  const handleDataSubmit = (inputData: TopsisData) => {
    setData(inputData);
    const analysisResults = performTopsisAnalysis(inputData);
    setResults(analysisResults);
    setActiveTab('results');
  };

  const handleExportExcel = () => {
    if (data && results) exportToExcel(data, results);
  };

  const handleExportPDF = () => {
    if (data && results) exportToPDF(data, results);
  };

  // limpa tudo e volta para a entrada de dados
  const handleReset = () => {
    setData(null);
    setResults(null);
    setActiveTab('input');
  };

  // marca todas as etapas como concluídas após o cálculo
  const updatedSteps = methodologySteps.map((step) => ({
    ...step,
    completed: results !== null,
    active: false,
  }));

  return (
    <div className="min-h-screen bg-background">

      {/* --------------- CABEÇALHO --------------- */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* logo e título */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-foreground">TOPSIS Analyzer</h1>
                <p className="text-xs text-muted-foreground">Análise Multicritério Acadêmica</p>
              </div>
            </div>

            {/* navegação desktop: botões de exportação e nova análise */}
            <nav className="hidden md:flex items-center gap-2">
              {results && (
                <>
                  <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex items-center gap-2">
                    <FileDown className="w-4 h-4" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Nova Análise
                  </Button>
                </>
              )}
            </nav>

            {/* botão hamburguer para mobile */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* menu mobile com animação */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-border py-4"
              >
                {results && (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportExcel} className="justify-start">
                      <FileDown className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF} className="justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="justify-start">
                      Nova Análise
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* --------------- HERO (visível apenas antes de calcular) --------------- */}
      {!results && (
        <section className="py-12 md:py-20 border-b border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Análise Multicritério
                <span className="text-accent"> TOPSIS</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Technique for Order Preference by Similarity to Ideal Solution
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ferramenta acadêmica para análise de decisão multicritério,
                desenvolvida para pesquisas de pós-graduação com rigor metodológico
                e transparência nas fórmulas matemáticas.
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* --------------- CONTEÚDO PRINCIPAL --------------- */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">

          {/* barra lateral com etapas (visível só após calcular, em telas grandes) */}
          {results && (
            <aside className="w-64 hidden lg:block">
              <StepIndicator steps={updatedSteps} currentStep={7} />
            </aside>
          )}

          {/* área principal com as abas */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                <TabsTrigger value="input" className="flex items-center gap-2 py-3">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Dados</span>
                </TabsTrigger>
                <TabsTrigger value="results" disabled={!results} className="flex items-center gap-2 py-3">
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Resultados</span>
                </TabsTrigger>
                <TabsTrigger value="charts" disabled={!results} className="flex items-center gap-2 py-3">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Gráficos</span>
                </TabsTrigger>
                <TabsTrigger value="methodology" className="flex items-center gap-2 py-3">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Metodologia</span>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="input" className="mt-6">
                  <DataInputSection onDataSubmit={handleDataSubmit} />
                </TabsContent>

                <TabsContent value="results" className="mt-6">
                  {data && results && <ResultsSection data={data} results={results} />}
                </TabsContent>

                <TabsContent value="charts" className="mt-6">
                  {data && results && <ChartsVisualization data={data} results={results} />}
                </TabsContent>

                <TabsContent value="methodology" className="mt-6">
                  <MethodologyInfo />
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </main>

      {/* --------------- RODAPÉ --------------- */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* autoria e contexto da pesquisa */}
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Sobre a Ferramenta</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Esta ferramenta web para aplicação do método multicritério TOPSIS foi desenvolvida por{' '}
                <strong className="text-foreground">Letícia do Nascimento Idalgo</strong>, no âmbito da pesquisa de mestrado intitulada{' '}
                <em>"Aplicação de métodos multicritério para a avaliação da influência da transformação digital na resiliência das cidades e em seu desenvolvimento social"</em>,
                sob orientação da <strong className="text-foreground">Profa. Dra. Daiane Chiroli</strong>, vinculada ao{' '}
                <strong className="text-foreground">Programa de Pós-Graduação em Engenharia Urbana da Universidade Estadual de Maringá (UEM)</strong>{' '}
                e ao <strong className="text-foreground">Grupo de Pesquisa Gestão da Logística Humanitária, Urbana e de Desastres</strong>,
                com foco na avaliação da resiliência urbana e no apoio à tomada de decisão em contextos complexos.
              </p>
            </div>

            {/* bloco de citação acadêmica */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-2 text-sm">Como Citar Esta Ferramenta</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Ao utilizar esta ferramenta em artigos científicos, dissertações, teses ou relatórios técnicos, cite como:
              </p>
              <p className="text-sm font-mono bg-background p-3 rounded border border-border text-foreground">
                IDALGO, L. N. <strong>Ferramenta web para aplicação do método multicritério TOPSIS</strong>.
                Maringá, [ano]. Disponível em: [URL]. Acesso em: [dia] [mês] [ano].
              </p>
            </div>

            {/* crédito metodológico */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Baseado na metodologia de Hwang &amp; Yoon (1981)
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
