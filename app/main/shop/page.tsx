// web/app/(main)/shop/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, Filter, Search, ChevronRight, Star, 
  Heart, ShoppingCart, Package, Truck, Shield,
  Flame, Sparkles, Award, X
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassSelect } from '@/components/glass/GlassSelect'
import GlassModal from '@/components/glass/GlassModal'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: 'candle' | 'book' | 'accessory'
  features: string[]
  inStock: boolean
  rating: number
  reviewCount: number
  isNew?: boolean
  isBestseller?: boolean
  hasNFC?: boolean
}

const products: Product[] = [
  {
    id: '1',
    name: 'Święta Świeca OREMUS z NFC',
    description: 'Ekskluzywna świeca z wbudowanym chipem NFC do łączenia się z aplikacją',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1602607220586-fddcfc508bea',
    category: 'candle',
    features: ['Chip NFC', 'Czas palenia 60h', 'Naturlny wosk', 'Ręcznie robiona'],
    inStock: true,
    rating: 4.8,
    reviewCount: 234,
    isNew: true,
    isBestseller: true,
    hasNFC: true
  },
  {
    id: '2',
    name: 'Świeca Adwentowa Premium',
    description: 'Zestaw 4 świec adwentowych w eleganckim opakowaniu',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1544978627-3e09094a0aef',
    category: 'candle',
    features: ['Zestaw 4 sztuk', 'Numerowane', 'Opakowanie prezentowe'],
    inStock: true,
    rating: 4.9,
    reviewCount: 89
  },
  {
    id: '3',
    name: 'Modlitewnik OREMUS',
    description: 'Pięknie ilustrowany modlitewnik z wybranymi modlitwami',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    category: 'book',
    features: ['300 stron', 'Twarda oprawa', 'Złocone brzegi', 'Ilustracje'],
    inStock: true,
    rating: 5.0,
    reviewCount: 156,
    isBestseller: true
  },
  {
    id: '4',
    name: 'Różaniec Kryształowy',
    description: 'Ręcznie robiony różaniec z kryształów Swarovskiego',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1605982048179-91970d0d3201',
    category: 'accessory',
    features: ['Kryształy Swarovski', 'Srebrny krzyżyk', 'Etui w zestawie'],
    inStock: true,
    rating: 4.7,
    reviewCount: 67
  },
  {
    id: '5',
    name: 'Świeca Wielkanocna z NFC',
    description: 'Paschał wielkanocny z technologią NFC',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1582593930265-6049bbc1f403',
    category: 'candle',
    features: ['Chip NFC', 'Wysokość 40cm', 'Złote zdobienia'],
    inStock: false,
    rating: 4.6,
    reviewCount: 45,
    hasNFC: true
  },
  {
    id: '6',
    name: 'Biblia Tysiąclecia - Edycja Luksusowa',
    description: 'Biblia w skórzanej oprawie ze złoceniami',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    category: 'book',
    features: ['Skórzana oprawa', 'Złocenia', 'Mapy', 'Przypisy'],
    inStock: true,
    rating: 5.0,
    reviewCount: 203
  }
]

interface CartItem {
  product: Product
  quantity: number
}

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
    
    // Load favorites
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    // Save favorites to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const filteredProducts = products
    .filter(product => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false
      }
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'popularity':
        default:
          return b.reviewCount - a.reviewCount
      }
    })

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    toast.success('Dodano do koszyka')
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId)
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      )
    }
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Sklep OREMUS
          </h1>
          <p className="text-lg text-white/70">
            Świece, książki i akcesoria religijne
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <GlassInput
                placeholder="Szukaj produktów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2">
              <GlassSelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'Wszystkie kategorie' },
                  { value: 'candle', label: 'Świece' },
                  { value: 'book', label: 'Książki' },
                  { value: 'accessory', label: 'Akcesoria' }
                ]}
              />
              <GlassSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'popularity', label: 'Popularność' },
                  { value: 'price_asc', label: 'Cena: rosnąco' },
                  { value: 'price_desc', label: 'Cena: malejąco' },
                  { value: 'rating', label: 'Ocena' }
                ]}
              />
              <GlassButton
                variant="secondary"
                onClick={() => setShowCart(true)}
                className="gap-2 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                Koszyk
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-secondary text-primary text-xs font-bold rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </GlassButton>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <GlassCard className="p-4 text-center">
            <Truck className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-white font-medium">Darmowa dostawa</p>
            <p className="text-white/50 text-sm">Zamówienia powyżej 100 zł</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-white font-medium">Bezpieczne płatności</p>
            <p className="text-white/50 text-sm">SSL, BLIK, Karta</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Package className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-white font-medium">30 dni na zwrot</p>
            <p className="text-white/50 text-sm">Bez pytań</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Award className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-white font-medium">Gwarancja jakości</p>
            <p className="text-white/50 text-sm">100% oryginalne produkty</p>
          </GlassCard>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <GlassCard className="h-full group" hover>
                <div className="relative">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden rounded-t-2xl">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.isNew && (
                        <span className="px-3 py-1 bg-secondary text-primary text-xs font-bold rounded-full">
                          NOWOŚĆ
                        </span>
                      )}
                      {product.isBestseller && (
                        <span className="px-3 py-1 bg-error text-white text-xs font-bold rounded-full">
                          BESTSELLER
                        </span>
                      )}
                      {product.hasNFC && (
                        <span className="px-3 py-1 bg-player text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          NFC
                        </span>
                      )}
                    </div>
                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-4 right-4 p-2 bg-glass-black rounded-full hover:bg-glass-white transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(product.id)
                            ? 'text-error fill-error'
                            : 'text-white'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {product.name}
                    </h3>
                    <p className="text-white/70 text-sm mb-4">
                      {product.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-secondary fill-secondary'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white/50 text-sm">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.features.slice(0, 2).map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-glass-white rounded-full text-white/70"
                        >
                          {feature}
                        </span>
                      ))}
                      {product.features.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-glass-white rounded-full text-white/70">
                          +{product.features.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {product.price} zł
                        </div>
                        {product.originalPrice && (
                          <div className="text-sm text-white/50 line-through">
                            {product.originalPrice} zł
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <GlassButton
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedProduct(product)}
                        >
                          Szczegóły
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                        >
                          {product.inStock ? 'Do koszyka' : 'Niedostępne'}
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Product Details Modal */}
        <GlassModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct?.name}
          size="lg"
        >
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative h-96 rounded-xl overflow-hidden">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-white/70 mb-4">{selectedProduct.description}</p>
                
                <h4 className="text-lg font-bold text-white mb-2">Cechy produktu:</h4>
                <ul className="space-y-2 mb-6">
                  {selectedProduct.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70">
                      <ChevronRight className="w-4 h-4 text-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {selectedProduct.price} zł
                    </div>
                    {selectedProduct.originalPrice && (
                      <div className="text-sm text-white/50 line-through">
                        {selectedProduct.originalPrice} zł
                      </div>
                    )}
                  </div>
                  <GlassButton
                    onClick={() => {
                      addToCart(selectedProduct)
                      setSelectedProduct(null)
                    }}
                    disabled={!selectedProduct.inStock}
                  >
                    {selectedProduct.inStock ? 'Dodaj do koszyka' : 'Niedostępne'}
                  </GlassButton>
                </div>
              </div>
            </div>
          )}
        </GlassModal>

        {/* Cart Modal */}
        <GlassModal
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          title="Koszyk"
          size="lg"
        >
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/70">Twój koszyk jest pusty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.product.name}</h4>
                      <p className="text-white/50 text-sm">{item.product.price} zł</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-glass-white hover:bg-glass-secondary transition-colors flex items-center justify-center"
                      >
                        <span className="text-white">-</span>
                      </button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-glass-white hover:bg-glass-secondary transition-colors flex items-center justify-center"
                      >
                        <span className="text-white">+</span>
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-2 p-1 rounded-lg hover:bg-glass-white transition-colors"
                      >
                        <X className="w-4 h-4 text-white/50" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-glass-white pt-4">
                <div className="flex justify-between text-xl font-bold text-white mb-4">
                  <span>Suma:</span>
                  <span>{getTotalPrice().toFixed(2)} zł</span>
                </div>
                <GlassButton className="w-full" size="lg">
                  Przejdź do płatności
                </GlassButton>
              </div>
            </>
          )}
        </GlassModal>
      </div>
    </div>
  )
}