import { ClipboardList, Search, Percent, ShieldCheck, Database, ShoppingCart, Menu, X } from 'lucide-react';
import { DiscountTier } from '../types';

interface HeaderProps {
  discountTier: DiscountTier;
  onDiscountTierChange: (tier: DiscountTier) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedSection: 'all' | 'catalogo' | 'promociones';
  onSectionChange: (section: 'all' | 'catalogo' | 'promociones') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenEditor: () => void;
}

export default function Header({
  discountTier,
  onDiscountTierChange,
  searchQuery,
  onSearchQueryChange,
  selectedSection,
  onSectionChange,
  cartCount,
  onOpenCart,
  onOpenEditor,
}: HeaderProps) {
  const discountTiers: { value: DiscountTier; label: string; desc: string; color: string }[] = [
    { value: 'NONE', label: 'Sin Descuento', desc: 'Precios veterinarios base', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    { value: '30%', label: 'Desc. 30%', desc: '30% Off del precio veterinario', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { value: '40%', label: 'Desc. 40%', desc: '40% Off del precio veterinario', color: 'bg-green-50 text-green-800 border-green-200' },
    { value: '50%', label: 'Desc. 50%', desc: '50% Off del precio veterinario', color: 'bg-teal-50 text-teal-800 border-teal-200' },
    { value: '50%+5%', label: 'Desc. 50%+5%', desc: 'Cascada: 50% Off + 5% extra (Neto: 52.5% Off)', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    { value: 'WHOLESALER', label: 'Distribuidor (Mínimo)', desc: 'Precios fijos especiales directos de fábrica', color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-sm shadow-xs" id="shop-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20" id="main-logo">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-neutral-900 leading-none">VetWholesale</h1>
              <span className="text-[10px] font-mono font-medium text-teal-600 uppercase tracking-wider">Web Shop SPA</span>
            </div>
          </div>

          {/* Section Filter Component */}
          <div className="hidden md:flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs font-medium">
            <button
              onClick={() => onSectionChange('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedSection === 'all'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              id="filter-all"
            >
              🚀 Todos los Productos
            </button>
            <button
              onClick={() => onSectionChange('catalogo')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedSection === 'catalogo'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              id="filter-catalogo"
            >
              🩺 Catálogo Veterinario
            </button>
            <button
              onClick={() => onSectionChange('promociones')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedSection === 'promociones'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              id="filter-promociones"
            >
              ⚡ Promociones
            </button>
          </div>

          {/* Search bar inside header */}
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por código, nombre o categoría..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-3 text-xs outline-hidden transition-all placeholder:text-zinc-400 focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500/20"
              id="search-input-header"
            />
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex items-center gap-2">
            {/* JSON Data Manager Button */}
            <button
              onClick={onOpenEditor}
              title="Administrar JSON (Catálogo y Distribuidores)"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 active:bg-zinc-100"
              id="btn-edit-json-data"
            >
              <Database className="h-4 w-4 text-purple-600" />
              <span className="hidden md:inline">Editar Base JSON</span>
            </button>

            {/* Cart Button with visual indicator */}
            <button
              onClick={onOpenCart}
              className="relative inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-xs font-bold text-white transition shadow-sm hover:bg-teal-700 active:scale-98"
              id="btn-sidebar-cart"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Mi Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white animate-bounce-short">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Pricing selector panel inside header for rapid adjustment */}
        <div className="py-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
            <Percent className="h-4 w-4 text-teal-600" />
            <span>Sistema de Liquidación y Descuentos:</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {discountTiers.map((tier) => (
              <button
                key={tier.value}
                onClick={() => onDiscountTierChange(tier.value)}
                className={`px-3 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                  discountTier === tier.value
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                }`}
                title={tier.desc}
                id={`discount-tier-btn-${tier.value.replace('%', 'pct')}`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input for Mobile only */}
        <div className="pb-3 pt-1 sm:hidden block">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por código, nombre..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs outline-hidden transition-all placeholder:text-zinc-400 focus:border-teal-500 focus:bg-white"
              id="search-input-mobile"
            />
          </div>
        </div>
        
      </div>
    </header>
  );
}
