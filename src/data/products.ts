import { Product } from '@/types/pos';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Coffee',
    price: 4.50,
    category: 'Beverages',
    description: 'Fresh brewed coffee',
    image_url: '',
    stock_quantity: 50,
    is_active: true
  },
  {
    id: 2,
    name: 'Croissant',
    price: 3.25,
    category: 'Bakery',
    description: 'Buttery croissant',
    image_url: '',
    stock_quantity: 20,
    is_active: true
  },
  {
    id: 3,
    name: 'Caesar Salad',
    price: 12.99,
    category: 'Food',
    description: 'Fresh caesar salad with croutons',
    image_url: '',
    stock_quantity: 15,
    is_active: true
  },
  {
    id: 4,
    name: 'Orange Juice',
    price: 3.75,
    category: 'Beverages',
    description: 'Freshly squeezed orange juice',
    image_url: '',
    stock_quantity: 30,
    is_active: true
  },
  {
    id: 5,
    name: 'Chocolate Muffin',
    price: 4.25,
    category: 'Bakery',
    description: 'Double chocolate chip muffin',
    image_url: '',
    stock_quantity: 25,
    is_active: true
  },
  {
    id: 6,
    name: 'Sandwich',
    price: 8.50,
    category: 'Food',
    description: 'Turkey and cheese sandwich',
    image_url: '',
    stock_quantity: 12,
    is_active: true
  },
  {
    id: 7,
    name: 'Latte',
    price: 5.25,
    category: 'Beverages',
    description: 'Espresso with steamed milk',
    image_url: '',
    stock_quantity: 40,
    is_active: true
  },
  {
    id: 8,
    name: 'Bagel',
    price: 2.75,
    category: 'Bakery',
    description: 'Everything bagel with cream cheese',
    image_url: '',
    stock_quantity: 18,
    is_active: true
  }
];

export const categories = ['All', 'Beverages', 'Food', 'Bakery'];