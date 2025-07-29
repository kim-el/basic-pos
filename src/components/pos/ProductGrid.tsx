'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/types/pos';

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);

  // Fetch products from database
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      // Check if data is an array
      if (Array.isArray(data)) {
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(data.map((p: Product) => p.category))];
        setCategories(uniqueCategories);
      } else {
        console.error('API returned non-array data:', data);
        // Fallback to mock data if API fails
        const { mockProducts, categories: mockCategories } = await import('@/data/products');
        setProducts(mockProducts);
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Fallback to mock data
      try {
        const { mockProducts, categories: mockCategories } = await import('@/data/products');
        setProducts(mockProducts);
        setCategories(mockCategories);
      } catch (fallbackError) {
        console.error('Failed to load fallback data:', fallbackError);
      }
    }
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleCategoryChange = (category: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(category);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 transition-all duration-200">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="transition-all duration-200 ease-in-out hover:scale-105 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={selectedCategory} className="flex-1 mt-2 sm:mt-4">
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 h-full overflow-y-auto transition-all duration-300 ease-in-out ${
              isTransitioning 
                ? 'opacity-0 transform translate-y-2' 
                : 'opacity-100 transform translate-y-0'
            }`}
          >
            {filteredProducts.map((product, index) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out h-fit animate-in fade-in-0 slide-in-from-bottom-1 touch-manipulation"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
                onClick={() => onAddToCart(product)}
              >
                <CardContent className="p-3 sm:p-4 h-full">
                  <div className="flex flex-col h-full min-h-[160px] sm:min-h-[200px]">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg mb-2 h-[2.5rem] sm:h-[3rem] overflow-hidden leading-tight">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 h-[2rem] sm:h-[2.5rem] overflow-hidden leading-tight">{product.description}</p>
                      <Badge variant="secondary" className="mb-2 sm:mb-3 transition-colors duration-200 text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <span className="text-lg sm:text-xl font-bold text-green-600 transition-colors duration-200">
                        ${product.price.toFixed(2)}
                      </span>
                      <Button 
                        size="sm" 
                        className="transition-all duration-200 active:scale-95 px-4 py-2 text-sm font-medium touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}