import { HelpCircle, Star, Package, Check, AlertTriangle, XCircle, Plus, Minus } from 'lucide-react';
import { Product, DiscountTier } from '../types';

interface ProductCardProps {
  product: Product;
  discountTier: DiscountTier;
  wholesalerPrice?: number;
  cartQuantity: number;
  onSetQuantity: (quantity: number) => void;
}

export function calculatePrice(vetPrice: number, tier: DiscountTier, wholesalerPrice?: number): { finalPrice: number; breakdown: string } {
  if (tier === 'NONE') {
    return { finalPrice: vetPrice, breakdown: 'Precio Base Veterinario' };
  }
  if (tier === '30%') {
    return { finalPrice: Number((vetPrice * 0.70).toFixed(2)), breakdown: '-30% de Descuento' };
  }
  if (tier === '40%') {
    return { finalPrice: Number((vetPrice * 0.60).toFixed(2)), breakdown: '-40% de Descuento' };
  }
  if (tier === '50%') {
    return { finalPrice: Number((vetPrice * 0.50).toFixed(2)), breakdown: '-50% de Descuento' };
  }
  if (tier === '50%+5%') {
    // Cascading: Price * 0.50 * 0.95
    return { finalPrice: Number((vetPrice * 0.50 * 0.95).toFixed(2)), breakdown: '50% + 5% Cascada (Neta: 52.5%)' };
  }
  if (tier === 'WHOLESALER') {
    if (wholesalerPrice !== undefined) {
      return { finalPrice: wholesalerPrice, breakdown: 'Tarifa Fijo Distribuidor' };
    }
    // Fallback: 50% discount if not present in wholesalers.json
    return { finalPrice: Number((vetPrice * 0.50).toFixed(2)), breakdown: 'Distribuidor No Encontrado (Aplicado -50% temporal)' };
  }
  return { finalPrice: vetPrice, breakdown: 'Precio Veterinario' };
}

export default function ProductCard({
  product,
  discountTier,
  wholesalerPrice,
  cartQuantity,
  onSetQuantity,
}: ProductCardProps) {
  const { finalPrice, breakdown } = calculatePrice(product.vetPrice, discountTier, wholesalerPrice);
  const isDiscounted = discountTier !== 'NONE';

  // Stock status styling helpers
  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return { text: 'Sin Stock', style: 'text-rose-600 bg-rose-50 border-rose-100', icon: <XCircle className="h-3.5 w-3.5" /> };
    }
    if (stock <= 10) {
      return { text: `Últimas ${stock} u.`, style: 'text-amber-700 bg-amber-50 border-amber-100', icon: <AlertTriangle className="h-3.5 w-3.5" /> };
    }
    return { text: `${stock} Disp.`, style: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: <Check className="h-3.5 w-3.5" /> };
  };

  const stockStatus = getStockStatus(product.stock);

  // Background colors depending on section (catalogo vs promociones)
  const isPromoSec = product.section === 'promociones';

  return (
    <div 
      className={`group relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 hover:shadow-md hover:border-zinc-300 ${
        isPromoSec ? 'ring-1 ring-violet-500/15' : ''
      }`}
      id={`product-card-${product.code}`}
    >
      {/* Top Badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-mono text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
          {product.code}
        </span>
        <div className="flex items-center gap-1">
          {product.badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isPromoSec ? 'bg-violet-100 text-violet-800' : 'bg-teal-50 text-teal-700'
            }`}>
              {product.badge}
            </span>
          )}
          <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded-md ${stockStatus.style} flex items-center gap-0.5`}>
            {stockStatus.icon}
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Main product identifiers */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-bold text-teal-600 font-mono tracking-wide uppercase">
            {product.category}
          </span>
          <span className="text-[10px] text-zinc-300">•</span>
          <span className={`text-[9px] font-bold uppercase rounded px-1 ${
            isPromoSec ? 'bg-indigo-50 text-indigo-700 font-sans' : 'bg-slate-50 text-slate-700'
          }`}>
            {isPromoSec ? '⚡ Promociones' : '🩺 Catálogo'}
          </span>
        </div>
        <h3 className="text-[13px] font-bold text-zinc-950 line-clamp-2 min-h-[38px] leading-tight" title={product.name}>
          {product.name}
        </h3>
        <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 min-h-[32px] leading-snug">
          {product.description}
        </p>
      </div>

      {/* Pricing Calculation Frame */}
      <div className="border-t border-dashed border-zinc-100 pt-3 mt-auto mb-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] text-zinc-500 font-medium">Veterinario Base:</span>
          <span className={`text-xs text-zinc-600 font-medium ${isDiscounted ? 'line-through text-zinc-400' : ''}`}>
            ${product.vetPrice.toFixed(2)} USD
          </span>
        </div>

        {/* Real discounted Price */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10.5px] font-bold text-zinc-700 flex items-center gap-0.5">
            Tarifa Neto:
          </span>
          <span className={`text-base font-extrabold tracking-tight ${
            isDiscounted 
              ? isPromoSec ? 'text-violet-700' : 'text-emerald-700'
              : 'text-zinc-900'
          }`}>
            ${finalPrice.toFixed(2)} USD
          </span>
        </div>

        {/* Calculation tag */}
        <div className="mt-1 text-right">
          <span className={`inline-block text-[9.5px] font-semibold px-1 rounded ${
            isDiscounted ? 'bg-indigo-50 text-indigo-700' : 'bg-zinc-50 text-zinc-600'
          }`}>
            {breakdown}
          </span>
        </div>
      </div>

      {/* Counter Button and Cart Actions */}
      <div className="mt-2" id={`action-${product.code}`}>
        {cartQuantity > 0 ? (
          <div className="flex items-center justify-between w-full h-8 bg-zinc-50 border border-zinc-200 rounded-lg p-0.5">
            <button
              onClick={() => onSetQuantity(Math.max(0, cartQuantity - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white text-zinc-600 hover:text-zinc-900 transition active:scale-90"
              id={`btn-dec-${product.code}`}
            >
              <Minus className="h-3 w-3" />
            </button>
            <input
              type="number"
              min="0"
              max={product.stock}
              value={cartQuantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onSetQuantity(Math.min(product.stock, Math.max(0, val)));
              }}
              className="w-12 text-center text-xs font-bold text-zinc-900 bg-transparent border-0 ring-0 focus:ring-0 focus:outline-hidden"
              id={`input-qty-${product.code}`}
            />
            <button
              onClick={() => onSetQuantity(Math.min(product.stock, cartQuantity + 1))}
              disabled={cartQuantity >= product.stock}
              className={`flex h-7 w-7 items-center justify-center rounded-md hover:bg-white text-zinc-600 hover:text-zinc-900 transition active:scale-90 ${
                cartQuantity >= product.stock ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              id={`btn-inc-${product.code}`}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSetQuantity(1)}
            disabled={product.stock <= 0}
            className={`w-full h-8 text-xs font-bold flex items-center justify-center gap-1.5 rounded-lg border border-teal-600 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition shadow-xs active:scale-98 ${
              product.stock <= 0 
                ? 'opacity-40 bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed hover:bg-zinc-100' 
                : 'cursor-pointer'
            }`}
            id={`btn-add-${product.code}`}
          >
            <Plus className="h-3 w-3" />
            Agregar al Pedido
          </button>
        )}
      </div>
    </div>
  );
}
