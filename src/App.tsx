import { useState, useEffect } from 'react';
import { ShoppingCart, LayoutGrid, Info, Tag, Database, SlidersHorizontal, Heart, ShieldAlert } from 'lucide-react';

// Type definitions
import { Product, WholesalerPrice, DiscountTier, CartItem } from './types';

// Embedded Local JSON Data
import defaultCatalog from './data/catalog.json';
import defaultWholesalers from './data/wholesalers.json';

// Components
import Header from './components/Header';
import ProductCard, { calculatePrice } from './components/ProductCard';
import CartList from './components/CartList';
import DataEditor from './components/DataEditor';

export default function App() {
  // State for Catalog and Wholesalers
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [wholesalerPrices, setWholesalerPrices] = useState<WholesalerPrice[]>([]);
  
  // App filters and selections
  const [discountTier, setDiscountTier] = useState<DiscountTier>('NONE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<'all' | 'catalogo' | 'promociones'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Cart State (Unified for both promociones and catalogo)
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Initial Data Loading & Synchronization
  useEffect(() => {
    // Load from local storage if available, fallback to imported JSON files
    const storedCatalog = localStorage.getItem('vet_shop_catalog');
    const storedWholesaler = localStorage.getItem('vet_shop_wholesaler_prices');
    const storedCart = localStorage.getItem('vet_shop_cart');
    const storedDiscount = localStorage.getItem('vet_shop_discount_tier');

    if (storedCatalog) {
      setCatalog(JSON.parse(storedCatalog));
    } else {
      setCatalog(defaultCatalog as Product[]);
    }

    if (storedWholesaler) {
      setWholesalerPrices(JSON.parse(storedWholesaler));
    } else {
      setWholesalerPrices(defaultWholesalers as WholesalerPrice[]);
    }

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    if (storedDiscount) {
      setDiscountTier(storedDiscount as DiscountTier);
    }
  }, []);

  // 2. Persist Cart & Selections automatically
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('vet_shop_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('vet_shop_cart');
    }
  }, [cart]);

  // Sync state mutations to storage
  const handleSaveData = (updatedCatalog: Product[], updatedWholesaler: WholesalerPrice[]) => {
    setCatalog(updatedCatalog);
    setWholesalerPrices(updatedWholesaler);
    localStorage.setItem('vet_shop_catalog', JSON.stringify(updatedCatalog));
    localStorage.setItem('vet_shop_wholesaler_prices', JSON.stringify(updatedWholesaler));

    // Recalculate cart item prices automatically on catalog/wholesaler changes
    const updatedCart = cart.map(item => {
      const matchInCatalog = updatedCatalog.find(p => p.code === item.product.code);
      if (!matchInCatalog) return null; // Remove if deleted from catalog

      const matchesWholesaler = updatedWholesaler.find(w => w.code === item.product.code);
      const calculated = calculatePrice(
        matchInCatalog.vetPrice,
        discountTier,
        matchesWholesaler?.price
      );

      return {
        ...item,
        product: matchInCatalog,
        finalUnitPrice: calculated.finalPrice,
        appliedDiscountTier: discountTier
      };
    }).filter(Boolean) as CartItem[];

    setCart(updatedCart);
  };

  const handleResetToDefault = () => {
    setCatalog(defaultCatalog as Product[]);
    setWholesalerPrices(defaultWholesalers as WholesalerPrice[]);
    setCart([]);
    setDiscountTier('NONE');
    localStorage.removeItem('vet_shop_catalog');
    localStorage.removeItem('vet_shop_wholesaler_prices');
    localStorage.removeItem('vet_shop_cart');
    localStorage.removeItem('vet_shop_discount_tier');
  };

  // Switch discount tiers - updates cart item prices as well (or keep original applied rate)
  const handleDiscountTierChange = (tier: DiscountTier) => {
    setDiscountTier(tier);
    localStorage.setItem('vet_shop_discount_tier', tier);

    // Dynamic cart recalculation for B2B efficiency!
    // When the discount tier is changed at the top of the store, the whole catalog changes
    // and the cart products update their net prices immediately.
    const updatedCart = cart.map(item => {
      const correspondingWholesalerObj = wholesalerPrices.find(w => w.code === item.product.code);
      const calculated = calculatePrice(
        item.product.vetPrice,
        tier,
        correspondingWholesalerObj?.price
      );
      return {
        ...item,
        appliedDiscountTier: tier,
        finalUnitPrice: calculated.finalPrice,
      };
    });
    setCart(updatedCart);
  };

  // 3. Cart State Modifiers
  const handleSetProductQuantity = (productCode: string, quantity: number) => {
    const productMatch = catalog.find(p => p.code === productCode);
    if (!productMatch) return;

    if (quantity <= 0) {
      // Remove item
      setCart(prev => prev.filter(item => item.product.code !== productCode));
      return;
    }

    const matchingWholesalerObj = wholesalerPrices.find(w => w.code === productCode);
    const pricing = calculatePrice(productMatch.vetPrice, discountTier, matchingWholesalerObj?.price);

    setCart(prev => {
      const existsIdx = prev.findIndex(item => item.product.code === productCode);
      if (existsIdx > -1) {
        const nextCart = [...prev];
        nextCart[existsIdx] = {
          ...nextCart[existsIdx],
          quantity: quantity,
          finalUnitPrice: pricing.finalPrice,
          appliedDiscountTier: discountTier,
        };
        return nextCart;
      } else {
        return [
          ...prev,
          {
            product: productMatch,
            quantity: quantity,
            appliedDiscountTier: discountTier,
            finalUnitPrice: pricing.finalPrice,
          },
        ];
      }
    });
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('vet_shop_cart');
  };

  // 4. Filtering and categorization logic
  const categories: string[] = ['all', ...Array.from(new Set(catalog.map((p) => p.category)))];

  const filteredProducts = catalog.filter((product) => {
    // Section match (all vs catalogo vs promociones)
    if (selectedSection !== 'all' && product.section !== selectedSection) {
      return false;
    }

    // Category match
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }

    // Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      return (
        product.code.toLowerCase().includes(q) ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-teal-500/20 selection:text-teal-900" id="main-shop-app">
      
      {/* Dynamic Header */}
      <Header
        discountTier={discountTier}
        onDiscountTierChange={handleDiscountTierChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedSection={selectedSection}
        onSectionChange={(sec) => {
          setSelectedSection(sec);
          setSelectedCategory('all'); // Reset category filter on section switch
        }}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenEditor={() => setIsEditorOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 relative" id="shop-main-layout">
        
        {/* Compact Grid Catalog Section */}
        <div className="flex-1 space-y-6">
          
          {/* Section banner and Quick stats */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs" id="quick-banner">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                <span>Sesión activa:</span>
                <span className="font-mono text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded text-[10.5px]">roberto940210 (Médico Vet)</span>
              </div>
              <h2 className="text-base font-extrabold tracking-tight text-neutral-900 flex items-center gap-1.5">
                {selectedSection === 'all' && '🚀 Todos los Productos'}
                {selectedSection === 'catalogo' && '🩺 Catálogo General de Farmacia'}
                {selectedSection === 'promociones' && '⚡ Promociones y Packs de Liquidación'}
                <span className="text-xs text-neutral-400 font-normal">({filteredProducts.length} veterinario items)</span>
              </h2>
            </div>

            {/* Quick configuration summary tool */}
            <div className="flex flex-wrap items-center gap-3 text-xs bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
              <div className="flex items-center gap-1">
                <Tag className="h-4.5 w-4.5 text-teal-600" />
                <span className="font-semibold text-zinc-700">Canal de Ventas:</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="bg-teal-50 border border-teal-200 text-teal-800 px-2 py-0.5 rounded-md font-bold">
                  {discountTier === 'NONE' ? 'B2C' : 'B2B Mayorista'}
                </span>
                <span className="text-zinc-300">/</span>
                <span className="bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                  Tasa: {discountTier === 'NONE' ? '0%' : discountTier}
                </span>
              </div>
            </div>
          </div>

          {/* Categories Horizontal Scroller for fast filter */}
          <div className="space-y-1.5" id="category-filter-bar">
            <label className="text-[10.5px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
              Filtrar por Categoría Terapéutica:
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                  }`}
                  id={`cat-btn-${cat.toLowerCase()}`}
                >
                  {cat === 'all' ? '🔍 Mostrar Todo' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid deck */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center flex flex-col items-center justify-center text-zinc-500" id="empty-results-box">
              <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-3 text-zinc-400">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-zinc-900">No se encontraron productos</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">
                Intente modificando los términos de búsqueda o verifique la sección terapéutica seleccionada.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSection('all');
                }}
                className="mt-4 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 text-xs font-bold px-4 py-2 rounded-lg"
              >
                Limpiar todos los filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="products-grid-deck">
              {filteredProducts.map((p) => {
                const whObj = wholesalerPrices.find((w) => w.code === p.code);
                const cartQtyObj = cart.find((item) => item.product.code === p.code);
                return (
                  <ProductCard
                    key={p.code}
                    product={p}
                    discountTier={discountTier}
                    wholesalerPrice={whObj?.price}
                    cartQuantity={cartQtyObj?.quantity || 0}
                    onSetQuantity={(qty) => handleSetProductQuantity(p.code, qty)}
                  />
                );
              })}
            </div>
          )}

          {/* Whitelist disclaimer check */}
          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 text-xs flex items-start gap-2 text-zinc-500 leading-snug">
            <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-800">Nota para Distribuidores y Encargados de Compras:</p>
              <p>
                Los descuentos del <span className="font-bold">30%, 40%, y 50%</span> se aplican directamente sobre la tarifa veterinaria base. El <span className="font-bold">50%+5%</span> se liquida secuencialmente en cascada corporativa nacional (Veterinario × 0.50 × 0.95). Los precios de <span className="font-bold">Distribuidor (Wholesaler)</span> corresponden a cotizaciones de fábrica cargados en su planilla <span className="font-semibold">wholesalers.json</span>.
              </p>
            </div>
          </div>

        </div>

        {/* Sidebar Cart Column on Desktop */}
        <aside className="w-80 shrink-0 hidden xl:block self-start sticky top-24" id="desktop-sidebar-cart">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs h-[650px] flex flex-col">
            <CartList
              cartItems={cart}
              onSetQuantity={handleSetProductQuantity}
              onClearCart={handleClearCart}
              onClose={() => {}}
              activeDiscountTier={discountTier}
            />
          </div>
        </aside>

      </main>

      {/* Slide-over cart drawer for mobile/tablet screens */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/40 backdrop-blur-xs xl:hidden" id="mobile-cart-backdrop">
          <div className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col">
            <CartList
              cartItems={cart}
              onSetQuantity={handleSetProductQuantity}
              onClearCart={handleClearCart}
              onClose={() => setIsCartOpen(false)}
              activeDiscountTier={discountTier}
            />
          </div>
        </div>
      )}

      {/* Live Data Sandbox JSON Editor modal */}
      {isEditorOpen && (
        <DataEditor
          initialCatalog={catalog}
          initialWholesalers={wholesalerPrices}
          onSaveData={handleSaveData}
          onResetToDefault={handleResetToDefault}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

    </div>
  );
}
