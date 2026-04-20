import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Plus, Trash2, ArrowUp, ArrowDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TopsisData, Alternative, Criterion, CriterionType } from '@/types/topsis';
import { normalizeWeights } from '@/utils/topsisCalculations';
import { toast } from 'sonner';

// --------------- SEÇÃO DE ENTRADA DE DADOS ---------------

interface DataInputSectionProps {
  onDataSubmit: (data: TopsisData) => void;
}

interface LocalData {
  id: string;
  name: string;
}

export function DataInputSection({ onDataSubmit }: DataInputSectionProps) {
  const [inputMethod, setInputMethod] = useState<'upload' | 'manual'>('manual'); // método de entrada selecionado

  // locais = alternativas a serem comparadas
  const [locais, setLocais] = useState<LocalData[]>([
    { id: '1', name: 'Local 1' },
    { id: '2', name: 'Local 2' },
  ]);

  // indicadores = critérios com seus dados completos e valores por local
  const [indicadores, setIndicadores] = useState<{
    id: string;
    numero: string;
    nome: string;
    tipo: CriterionType;
    pesoDematel: number;
    valores: number[]; // um valor por local
  }[]>([
    { id: '1', numero: '1', nome: 'Indicador 1', tipo: 'benefit', pesoDematel: 0.5, valores: [0, 0] },
    { id: '2', numero: '2', nome: 'Indicador 2', tipo: 'benefit', pesoDematel: 0.5, valores: [0, 0] },
  ]);

  const [dragActive, setDragActive] = useState(false); // controla o estado visual da zona de drag

  // --------------- HANDLERS DE DRAG AND DROP ---------------

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // lê e interpreta o arquivo Excel/CSV enviado
  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0]; // usa a primeira aba
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          toast.error('A planilha deve conter pelo menos uma linha de cabeçalho e uma linha de dados.');
          return;
        }

        const headers = jsonData[0] as string[];

        // colunas esperadas: Número | Nome | Tipo | Peso | Local1 | Local2 | ...
        const localStartIndex = 4;
        const localNames = headers.slice(localStartIndex).filter(h => h && String(h).trim());

        if (localNames.length === 0) {
          toast.error('Nenhum local encontrado na planilha.');
          return;
        }

        const newLocais: LocalData[] = localNames.map((name, index) => ({
          id: String(index + 1),
          name: String(name).trim(),
        }));

        // processa cada linha como um indicador
        const newIndicadores = jsonData.slice(1)
          .filter(row => row.length > 0 && (row[0] || row[1]))
          .map((row, index) => ({
            id: String(index + 1),
            numero: String(row[0] || index + 1),
            nome: String(row[1] || `Indicador ${index + 1}`),
            tipo: (String(row[2] || '').toLowerCase().includes('custo') ? 'cost' : 'benefit') as CriterionType,
            pesoDematel: parseFloat(String(row[3] || '0').replace(',', '.')) || 0,
            valores: localNames.map((_, i) => {
              const val = row[localStartIndex + i];
              const num = parseFloat(String(val || '0').replace(',', '.'));
              return isNaN(num) ? 0 : num;
            }),
          }));

        setLocais(newLocais);
        setIndicadores(newIndicadores);
        setInputMethod('manual'); // vai para a tabela manual após importar
        toast.success(`Dados importados: ${newIndicadores.length} indicadores, ${newLocais.length} locais`);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        toast.error('Erro ao processar o arquivo. Verifique o formato da planilha.');
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  // --------------- GERENCIAMENTO DE LOCAIS ---------------

  const addLocal = () => {
    const newId = String(locais.length + 1);
    setLocais([...locais, { id: newId, name: `Local ${newId}` }]);
    setIndicadores(indicadores.map(ind => ({ // adiciona coluna de valor para o novo local
      ...ind,
      valores: [...ind.valores, 0],
    })));
  };

  const removeLocal = (index: number) => {
    if (locais.length <= 1) { toast.error('É necessário pelo menos 1 local.'); return; }
    setLocais(locais.filter((_, i) => i !== index));
    setIndicadores(indicadores.map(ind => ({
      ...ind,
      valores: ind.valores.filter((_, i) => i !== index), // remove a coluna do local excluído
    })));
  };

  const updateLocalName = (index: number, name: string) => {
    const updated = [...locais];
    updated[index] = { ...updated[index], name };
    setLocais(updated);
  };

  // --------------- GERENCIAMENTO DE INDICADORES ---------------

  const addIndicador = () => {
    const newId = String(indicadores.length + 1);
    setIndicadores([...indicadores, {
      id: newId,
      numero: newId,
      nome: `Indicador ${newId}`,
      tipo: 'benefit',
      pesoDematel: 0,
      valores: new Array(locais.length).fill(0), // inicializa zeros para todos os locais
    }]);
  };

  const removeIndicador = (index: number) => {
    if (indicadores.length <= 1) { toast.error('É necessário pelo menos 1 indicador.'); return; }
    setIndicadores(indicadores.filter((_, i) => i !== index));
  };

  const updateIndicador = (index: number, field: string, value: any) => {
    const updated = [...indicadores];
    updated[index] = { ...updated[index], [field]: value };
    setIndicadores(updated);
  };

  const updateIndicadorValor = (indIndex: number, localIndex: number, value: number) => {
    const updated = [...indicadores];
    const valores = [...updated[indIndex].valores];
    valores[localIndex] = value;
    updated[indIndex] = { ...updated[indIndex], valores };
    setIndicadores(updated);
  };

  // --------------- SUBMISSÃO DA ANÁLISE ---------------

  const handleSubmit = () => {
    if (indicadores.length === 0) { toast.error('Adicione pelo menos um indicador.'); return; }
    if (locais.length === 0)      { toast.error('Adicione pelo menos um local.'); return; }

    const totalWeight = indicadores.reduce((sum, ind) => sum + ind.pesoDematel, 0);
    if (totalWeight === 0) { toast.error('Defina os pesos DEMATEL para os indicadores.'); return; }

    // normaliza os pesos para que somem 1
    const weights = indicadores.map(ind => ind.pesoDematel);
    const normalizedWeights = normalizeWeights(weights);

    const criteria: Criterion[] = indicadores.map((ind, i) => ({
      id: ind.id,
      name: ind.nome,
      type: ind.tipo,
      weight: normalizedWeights[i],
    }));

    // cada local vira uma alternativa com os valores de todos os indicadores
    const alternatives: Alternative[] = locais.map((local, localIndex) => ({
      id: local.id,
      name: local.name,
      values: indicadores.map(ind => ind.valores[localIndex] || 0),
    }));

    onDataSubmit({ criteria, alternatives });
    toast.success('Análise TOPSIS iniciada!');
  };

  // --------------- RENDERIZAÇÃO ---------------

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* seleção do método de entrada */}
      <div className="flex gap-4">
        <Button
          variant={inputMethod === 'upload' ? 'default' : 'outline'}
          onClick={() => setInputMethod('upload')}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload de Planilha
        </Button>
        <Button
          variant={inputMethod === 'manual' ? 'default' : 'outline'}
          onClick={() => setInputMethod('manual')}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Entrada Manual
        </Button>
      </div>

      {/* modo upload: zona de drag and drop */}
      {inputMethod === 'upload' && (
        <>
          <div
            className={`upload-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">Arraste sua planilha aqui</p>
                  <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar (XLSX, XLS, CSV)</p>
                </div>
              </div>
            </label>
          </div>

          {/* instrução do formato esperado */}
          <div className="methodology-box">
            <h4 className="font-semibold text-sm mb-2">Formato esperado da planilha:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Colunas: <code className="bg-muted px-1 rounded">Número | Nome | Tipo | Peso DEMATEL | Local 1 | Local 2 | ...</code></li>
              <li>• Linhas: um indicador por linha</li>
              <li>• Tipo: "Benefício" ou "Custo"</li>
            </ul>
          </div>
        </>
      )}

      {/* modo manual: tabela editável */}
      {inputMethod === 'manual' && (
        <div className="space-y-6">

          {/* card de gerenciamento dos locais (alternativas) */}
          <div className="academic-card">
            <div className="academic-card-header">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Locais Avaliados</h3>
                </div>
                <Button size="sm" onClick={addLocal} className="flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Adicionar Local
                </Button>
              </div>
            </div>
            <div className="academic-card-body">
              <div className="flex flex-wrap gap-3">
                {locais.map((local, index) => (
                  <div key={local.id} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                    <Input
                      value={local.name}
                      onChange={(e) => updateLocalName(index, e.target.value)}
                      className="h-8 w-40"
                      placeholder={`Local ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLocal(index)}
                      disabled={locais.length <= 1}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * Os locais representam as alternativas a serem comparadas na análise TOPSIS.
              </p>
            </div>
          </div>

          {/* card da matriz de dados unificada */}
          <div className="academic-card">
            <div className="academic-card-header">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold">Matriz de Dados Completa</h3>
                <Button size="sm" onClick={addIndicador} className="flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Adicionar Indicador
                </Button>
              </div>
            </div>
            <div className="academic-card-body overflow-x-auto">
              <table className="academic-table">
                <thead>
                  <tr>
                    <th className="w-20 text-center">Nº</th>
                    <th className="w-48">Nome do Indicador</th>
                    <th className="w-32">Tipo</th>
                    <th className="w-28">
                      <div className="flex flex-col">
                        <span>Peso</span>
                        <span className="text-xs font-normal text-muted-foreground">(DEMATEL)</span>
                      </div>
                    </th>
                    {locais.map((local) => ( // coluna dinâmica para cada local
                      <th key={local.id} className="min-w-28">
                        <div className="flex flex-col gap-1">
                          <span>{local.name}</span>
                          <span className="text-xs font-normal text-muted-foreground">Resultado</span>
                        </div>
                      </th>
                    ))}
                    <th className="w-16">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.map((ind, indIndex) => (
                    <tr key={ind.id}>
                      <td className="text-center">
                        <Input
                          value={ind.numero}
                          onChange={(e) => updateIndicador(indIndex, 'numero', e.target.value)}
                          className="h-9 w-16 text-center"
                          placeholder="#"
                        />
                      </td>
                      <td>
                        <Input
                          value={ind.nome}
                          onChange={(e) => updateIndicador(indIndex, 'nome', e.target.value)}
                          className="h-9"
                          placeholder="Nome do indicador"
                        />
                      </td>
                      <td>
                        <Select
                          value={ind.tipo}
                          onValueChange={(value: CriterionType) => updateIndicador(indIndex, 'tipo', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="benefit">
                              <span className="flex items-center gap-2">
                                <ArrowUp className="w-3 h-3 text-benefit" />
                                Benefício
                              </span>
                            </SelectItem>
                            <SelectItem value="cost">
                              <span className="flex items-center gap-2">
                                <ArrowDown className="w-3 h-3 text-cost" />
                                Custo
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          value={ind.pesoDematel}
                          onChange={(e) => updateIndicador(indIndex, 'pesoDematel', parseFloat(e.target.value) || 0)}
                          className="h-9"
                          placeholder="0.000"
                        />
                      </td>
                      {locais.map((_, localIndex) => ( // célula de valor para cada local
                        <td key={localIndex}>
                          <Input
                            type="number"
                            step="0.01"
                            value={ind.valores[localIndex] || 0}
                            onChange={(e) => updateIndicadorValor(indIndex, localIndex, parseFloat(e.target.value) || 0)}
                            className="h-9"
                            placeholder="0.00"
                          />
                        </td>
                      ))}
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIndicador(indIndex)}
                          disabled={indicadores.length <= 1}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* legenda explicativa dos campos */}
              <div className="methodology-box !mt-4 !mb-0">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-foreground">Tipo de Critério:</strong>
                    <ul className="text-muted-foreground mt-1 space-y-1">
                      <li className="flex items-center gap-2">
                        <ArrowUp className="w-3 h-3 text-benefit" />
                        <span><strong>Benefício:</strong> Quanto maior, melhor</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowDown className="w-3 h-3 text-cost" />
                        <span><strong>Custo:</strong> Quanto menor, melhor</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-foreground">Peso DEMATEL:</strong>
                    <p className="text-muted-foreground mt-1">
                      Os pesos representam a importância relativa de cada indicador,
                      oriundos da análise DEMATEL. Serão normalizados automaticamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* botão de execução da análise */}
          <div className="flex justify-center">
            <Button size="lg" onClick={handleSubmit} className="px-8">
              Executar Análise TOPSIS
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
