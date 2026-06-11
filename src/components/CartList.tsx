import { useState } from 'react';
import { ShoppingCart, Trash2, Send, CreditCard, ChevronRight, MessageSquare, Clipboard, Check, X } from 'lucide-react';
import { CartItem, DiscountTier } from '../types';

interface CartListProps {
  cartItems: CartItem[];
  onSetQuantity: (productCode: string, quantity: number) => void;
  onClearCart: () => void;
  onClose: () => void;
  activeDiscountTier: DiscountTier;
}

export default function CartList({
  cartItems,
  onSetQuantity,
  onClearCart,
  onClose,
  activeDiscountTier,
}: CartListProps) {
  const [orderNotes, setOrderNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Totals calculations
  const totalBasePrice = cartItems.reduce((acc, item) => acc + (item.product.vetPrice * item.quantity), 0);
  const totalNetPrice = cartItems.reduce((acc, item) => acc + (item.finalUnitPrice * item.quantity), 0);
  const totalSavings = totalBasePrice - totalNetPrice;

  // Separate items by category to display unified list or categorized lists
  const catalogItems = cartItems.filter(item => item.product.section === 'catalogo');
  const promoItems = cartItems.filter(item => item.product.section === 'promociones');

  // Format order summary text for clipboard or whatsapp export
  const buildOrderTextSummary = () => {
    let summary = `🐾 *PEDIDO DE PRODUCTOS VETERINARIOS* 🐾\n`;
    summary += `----------------------------------------\n`;
    summary += `📋 *Esquema de Descuento:* ${activeDiscountTier}\n\n`;

    if (catalogItems.length > 0) {
      summary += `🩺 *PRODUCTOS DE CATÁLOGO:*\n`;
      catalogItems.forEach(item => {
        const subtotal = item.finalUnitPrice * item.quantity;
        summary += `- [${item.product.code}] ${item.product.name}\n`;
        summary += `  Cant: ${item.quantity} u. x $${item.finalUnitPrice.toFixed(2)} = *$${subtotal.toFixed(2)} USD*\n`;
      });
      summary += `\n`;
    }

    if (promoItems.length > 0) {
      summary += `⚡ *PROMOCIONES & OFERTAS:*\n`;
      promoItems.forEach(item => {
        const subtotal = item.finalUnitPrice * item.quantity;
        summary += `- [${item.product.code}] ${item.product.name}\n`;
        summary += `  Cant: ${item.quantity} u. x $${item.finalUnitPrice.toFixed(2)} = *$${subtotal.toFixed(2)} USD*\n`;
      });
      summary += `\n`;
    }

    summary += `----------------------------------------\n`;
    summary += `💵 *Subtotal Veterinario Base:* $${totalBasePrice.toFixed(2)} USD\n`;
    summary += `🔥 *Ahorro Total Aplicado:* $${totalSavings.toFixed(2)} USD\n`;
    summary += `💰 *TOTAL GENERAL NETO:* *$${totalNetPrice.toFixed(2)} USD*\n`;

    if (orderNotes.trim()) {
      summary += `\n💬 *Observaciones / Notas:* ${orderNotes.trim()}\n`;
    }

    summary += `\n_Emitido desde la Plataforma VetWholesale SPA_`;
    return summary;
  };

  const handleCopyClipboard = () => {
    const text = buildOrderTextSummary();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(buildOrderTextSummary());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTriggerCheckout = () => {
    setOrderPlaced(true);
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900" id="cart-drawer-container">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 bg-neutral-50 shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-teal-600" />
          <h2 className="text-sm font-bold tracking-tight">Presupuesto del Pedido</h2>
          <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {cartItems.reduce((sum, i) => sum + i.quantity, 0)} u.
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
          id="btn-close-cart"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {orderPlaced ? (
        /* Purchase Success Screen */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center" id="purchase-success-view">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
            <Check className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">¡Pedido Presupuestado!</h3>
          <p className="text-xs text-zinc-500 max-w-xs mt-2 leading-relaxed">
            Hemos simulado la confirmación del pedido. Puede descargar el resumen o enviarlo por WhatsApp para concretar el despacho con el distribuidor.
          </p>

          <div className="mt-6 w-full max-w-xs space-y-2">
            <button
               onClick={handleSendWhatsApp}
               className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              <Send className="h-3.5 w-3.5" />
              Enviar por WhatsApp
            </button>
            <button
              onClick={handleCopyClipboard}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white py-2.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Clipboard className="h-3.5 w-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar Resumen de Pedido'}
            </button>
          </div>

          <button
            onClick={() => {
              onClearCart();
              setOrderPlaced(false);
              onClose();
            }}
            className="mt-8 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
            id="btn-return-shop"
          >
            ← Volver a la Tienda (Vaciar carro)
          </button>
        </div>
      ) : cartItems.length === 0 ? (
        /* Empty Cart View */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
          <ShoppingCart className="h-10 w-10 stroke-1 text-zinc-300 mb-2 animate-pulse" />
          <p className="text-xs font-medium">El carrito está vacío</p>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px]">
            Seleccione cantidades de productos del catálogo o promociones para presupuestar.
          </p>
        </div>
      ) : (
        /* Cart List View */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4" id="cart-items-scroll">
            
            {/* Unified Promo section items */}
            {promoItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-violet-700 bg-violet-50 px-2 py-1 rounded inline-block">
                  ⚡ Promociones del Carrito ({promoItems.length})
                </h4>
                <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden bg-white">
                  {promoItems.map((item) => (
                    <div key={item.product.code} className="p-3 text-xs flex items-start justify-between gap-2" id={`cart-row-${item.product.code}`}>
                      <div className="flex-1">
                        <div className="font-mono text-[9px] font-bold text-zinc-500 uppercase">{item.product.code}</div>
                        <div className="font-bold text-zinc-900 leading-tight">{item.product.name}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          <span>Precio original: ${item.product.vetPrice.toFixed(2)}</span>
                          <span>•</span>
                          <span className="font-semibold text-violet-600">Neto: ${item.finalUnitPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Quantity control */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-mono font-bold text-[12px] text-zinc-900">
                          ${(item.finalUnitPrice * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5">
                          <button
                            onClick={() => onSetQuantity(item.product.code, item.quantity - 1)}
                            className="text-zinc-500 hover:text-zinc-900 font-bold"
                          >
                            -
                          </button>
                          <span className="font-semibold px-1 text-[11px]">{item.quantity}</span>
                          <button
                            onClick={() => onSetQuantity(item.product.code, Math.min(item.product.stock, item.quantity + 1))}
                            className="text-zinc-500 hover:text-zinc-900 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unified Catalog section items */}
            {catalogItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded inline-block">
                  🩺 Catálogo del Carrito ({catalogItems.length})
                </h4>
                <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-lg overflow-hidden bg-white">
                  {catalogItems.map((item) => (
                    <div key={item.product.code} className="p-3 text-xs flex items-start justify-between gap-2" id={`cart-row-${item.product.code}`}>
                      <div className="flex-1">
                        <div className="font-mono text-[9px] font-bold text-zinc-500 uppercase">{item.product.code}</div>
                        <div className="font-bold text-zinc-900 leading-tight">{item.product.name}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          <span>Original: ${item.product.vetPrice.toFixed(2)}</span>
                          <span>•</span>
                          <span className="font-semibold text-teal-600">Neto: ${item.finalUnitPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Quantity controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-mono font-bold text-[12px] text-zinc-900">
                          ${(item.finalUnitPrice * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5">
                          <button
                            onClick={() => onSetQuantity(item.product.code, item.quantity - 1)}
                            className="text-zinc-500 hover:text-zinc-900 font-bold"
                          >
                            -
                          </button>
                          <span className="font-semibold px-1 text-[11px]">{item.quantity}</span>
                          <button
                            onClick={() => onSetQuantity(item.product.code, Math.min(item.product.stock, item.quantity + 1))}
                            className="text-zinc-500 hover:text-zinc-900 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dispatch Notes / Comments */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-zinc-200 space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
                Observaciones del Despacho / Notas:
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Ej: despachar por transporte OCA / urgente / incluir folletos..."
                className="w-full text-xs bg-white rounded-lg border border-zinc-200 p-2 focus:ring-1 focus:ring-teal-500 outline-hidden min-h-[60px]"
                id="cart-textarea-obs"
              />
            </div>

          </div>

          {/* Pricing Math Frame / Footer Checkout */}
          <div className="border-t border-zinc-100 p-4 bg-zinc-50 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal Base (Veterinario):</span>
                <span className="font-mono">${totalBasePrice.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Ahorro Calculado ({activeDiscountTier}):</span>
                <span className="font-mono">-${totalSavings.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-zinc-950 font-bold text-sm border-t border-zinc-250 pt-2">
                <span>Total Líquido Neto:</span>
                <span className="font-mono text-base text-teal-700">${totalNetPrice.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Copy / Whatsapp / Purchase panel */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCopyClipboard}
                className="flex items-center justify-center gap-1 border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 text-xs font-bold rounded-lg py-2 transition active:scale-98"
                id="btn-copy-summary"
                type="button"
                title="Copiar texto formateado"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Clipboard className="h-3.5 w-3.5" />}
                {copied ? '¡Copiado!' : 'Copiar Texto'}
              </button>
              
              <button
                onClick={handleSendWhatsApp}
                className="flex items-center justify-center gap-1 border border-transparent bg-emerald-600 text-white text-xs font-bold rounded-lg py-2 transition hover:bg-emerald-700 active:scale-98"
                id="btn-send-whatsapp"
                type="button"
              >
                <Send className="h-3.5 w-3.5" />
                WhatsApp
              </button>
            </div>

            <div className="pt-1">
              <button
                onClick={handleTriggerCheckout}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold py-2.5 shadow-sm hover:bg-teal-700 transition active:scale-95"
                id="btn-confirm-checkout"
              >
                <CreditCard className="h-4 w-4" />
                Enviar / Confirmar Presupuesto
              </button>
              <button
                onClick={onClearCart}
                className="w-full text-center text-[10px] font-semibold text-zinc-400 hover:text-rose-600 mt-2 hover:underline transition"
                id="btn-empty-cart-text"
              >
                <Trash2 className="h-3 w-3 inline mr-1" />
                Vaciar presupuesto completo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
