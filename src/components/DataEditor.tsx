import { useState } from 'react';
import { Database, Save, RotateCcw, AlertCircle, CheckCircle2, FileJson, X } from 'lucide-react';
import { Product, WholesalerPrice } from '../types';

interface DataEditorProps {
  initialCatalog: Product[];
  initialWholesalers: WholesalerPrice[];
  onSaveData: (updatedCatalog: Product[], updatedWholesalers: WholesalerPrice[]) => void;
  onResetToDefault: () => void;
  onClose: () => void;
}

export default function DataEditor({
  initialCatalog,
  initialWholesalers,
  onSaveData,
  onResetToDefault,
  onClose,
}: DataEditorProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'wholesaler'>('catalog');
  const [catalogText, setCatalogText] = useState(JSON.stringify(initialCatalog, null, 2));
  const [wholesalerText, setWholesalerText] = useState(JSON.stringify(initialWholesalers, null, 2));
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = () => {
    try {
      // Validate Catalog
      const parsedCatalog = JSON.parse(catalogText) as Product[];
      if (!Array.isArray(parsedCatalog)) {
        throw new Error('El formato de catalog.json debe ser un arreglo de objetos.');
      }
      for (const item of parsedCatalog) {
        if (!item.code || !item.name || typeof item.vetPrice !== 'number') {
          throw new Error(`Objeto inválido detectado en Catálogo: verifique el campo 'code' o 'nombr' o que 'vetPrice' sea numérico para: ${item.name || item.code || 'Desconocido'}`);
        }
      }

      // Validate Wholesalers
      const parsedWholesalers = JSON.parse(wholesalerText) as WholesalerPrice[];
      if (!Array.isArray(parsedWholesalers)) {
        throw new Error('El formato de wholesalers.json debe ser un arreglo de objetos.');
      }
      for (const item of parsedWholesalers) {
        if (!item.code || typeof item.price !== 'number') {
          throw new Error(`Objeto inválido detectado en Distribuidores: verifique que 'code' exista y 'price' sea un número válido.`);
        }
      }

      // If checks pass, persist
      onSaveData(parsedCatalog, parsedWholesalers);
      setStatusMessage({ type: 'success', text: '¡Estructura de datos JSON validada e integrada correctamente en el sistema!' });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Error de Parseo JSON: ${err.message}` });
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Seguro que desea restablecer los datos al catálogo inicial ilustrativo? Se perderán las modificaciones locales.')) {
      onResetToDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs" id="data-editor-modal">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col h-[600px] max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Administrador de Datos del Sistema (B2B Sandbox)</h2>
              <p className="text-[10px] text-zinc-500 font-medium">Inspeccione, edite raw JSON o cargue tarifas externas en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600"
            id="close-editor-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-3 border-b-2 text-center transition flex items-center justify-center gap-2 ${
              activeTab === 'catalog'
                ? 'border-purple-600 text-purple-700 bg-purple-50/20'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
            id="tab-edit-catalog"
          >
            <FileJson className="h-4 w-4 text-emerald-600" />
            Catálogo Base (catalog.json)
          </button>
          
          <button
            onClick={() => setActiveTab('wholesaler')}
            className={`flex-1 py-3 border-b-2 text-center transition flex items-center justify-center gap-2 ${
              activeTab === 'wholesaler'
                ? 'border-purple-600 text-purple-700 bg-purple-50/20'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
            id="tab-edit-wholesalers"
          >
            <FileJson className="h-4 w-4 text-purple-600" />
            Distribución (wholesalers.json)
          </button>
        </div>

        {/* Body TextArea Editor */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0 bg-zinc-950 text-zinc-200">
          <label className="text-[10px] text-zinc-400 font-mono mb-1.5 flex items-center justify-between">
            <span>Editor Interactivo de Arrays JSON (Modo Desarrollador)</span>
            <span className="text-zinc-500">{activeTab === 'catalog' ? 'catalog.json' : 'wholesalers.json'}</span>
          </label>
          {activeTab === 'catalog' ? (
            <textarea
              value={catalogText}
              onChange={(e) => setCatalogText(e.target.value)}
              className="flex-1 font-mono text-[11px] bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500 overflow-y-auto text-emerald-400 resize-none leading-relaxed select-text"
              id="raw-textarea-catalog"
            />
          ) : (
            <textarea
              value={wholesalerText}
              onChange={(e) => setWholesalerText(e.target.value)}
              className="flex-1 font-mono text-[11px] bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500 overflow-y-auto text-purple-400 resize-none leading-relaxed select-text"
              id="raw-textarea-wholesalers"
            />
          )}
        </div>

        {/* Display verification Status alerts inside the editor */}
        {statusMessage && (
          <div className={`px-6 py-2.5 flex items-center gap-2 text-xs font-semibold ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-t border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-t border-rose-200'
          }`} id="validation-msg-container">
            {statusMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
            <span className="line-clamp-2">{statusMessage.text}</span>
          </div>
        )}

        {/* Action Panel / Footer controls */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0 text-xs">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 active:scale-98"
            id="btn-reset-data"
          >
            <RotateCcw className="h-4 w-4 text-zinc-500" />
            Restablecer Iniciales
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-100 hover:bg-zinc-200 px-4 py-2 font-semibold text-zinc-700 transition cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 px-5 py-2 font-bold text-white shadow-xs transition active:scale-98"
              id="btn-validate-save-json"
            >
              <Save className="h-4 w-4" />
              Validar y Aplicar Cambios
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
