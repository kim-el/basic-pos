import { Product } from '@/types/pos';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coffee',
    price: 4.50,
    category: 'Beverages',
    description: 'Fresh brewed coffee',
    stock: 50
  },
  {
    id: '2',
    name: 'Croissant',
    price: 3.25,
    category: 'Bakery',
    description: 'Buttery croissant',
    stock: 20
  },
  {
    id: '3',
    name: 'Caesar Salad',
    price: 12.99,
    category: 'Food',
    description: 'Fresh caesar salad with croutons',
    stock: 15
  },
  {
    id: '4',
    name: 'Orange Juice',
    price: 3.75,
    category: 'Beverages',
    description: 'Freshly squeezed orange juice',
    stock: 30
  },
  {
    id: '5',
    name: 'Chocolate Muffin',
    price: 4.25,
    category: 'Bakery',
    description: 'Double chocolate chip muffin',
    stock: 25
  },
  {
    id: '6',
    name: 'Sandwich',
    price: 8.50,
    category: 'Food',
    description: 'Turkey and cheese sandwich',
    stock: 12
  },
  {
    id: '7',
    name: 'Latte',
    price: 5.25,
    category: 'Beverages',
    description: 'Espresso with steamed milk',
    stock: 40
  },
  {
    id: '8',
    name: 'Bagel',
    price: 2.75,
    category: 'Bakery',
    description: 'Everything bagel with cream cheese',
    stock: 18
  }
];

export const categories = ['All', 'Beverages', 'Food', 'Bakery'];