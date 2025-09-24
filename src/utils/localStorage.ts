export interface Product {
  id: string;
  name: string;
  price: number;
  buyingPrice?: number;
  sellingPrice?: number;
  stock: number;
  category: 'stationaries' | 'accessories' | 'tools' | 'games';
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  timestamp: Date;
}

// Products management
export const getProducts = (): Product[] => {
  const products = localStorage.getItem('pos_products');
  return products ? JSON.parse(products) : [
    { id: '1', name: 'Pen', price: 1.50, buyingPrice: 0.80, sellingPrice: 1.50, stock: 50, category: 'stationaries' },
    { id: '2', name: 'Notebook', price: 3.20, buyingPrice: 2.00, sellingPrice: 3.20, stock: 25, category: 'stationaries' },
    { id: '3', name: 'Phone Case', price: 15.99, buyingPrice: 10.00, sellingPrice: 15.99, stock: 12, category: 'accessories' },
    { id: '4', name: 'Hammer', price: 22.50, buyingPrice: 15.00, sellingPrice: 22.50, stock: 8, category: 'tools' },
    { id: '5', name: 'Screwdriver Set', price: 18.75, buyingPrice: 12.00, sellingPrice: 18.75, stock: 15, category: 'tools' },
    { id: '6', name: 'Chess Tournament', price: 29.99, stock: 0, category: 'games' },
  ];
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem('pos_products', JSON.stringify(products));
};

export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const removeProduct = (productId: string): void => {
  const products = getProducts().filter(p => p.id !== productId);
  saveProducts(products);
};

export const updateProductStock = (productId: string, newStock: number): void => {
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    products[productIndex].stock = newStock;
    saveProducts(products);
  }
};

export const updateProduct = (productId: string, updatedProduct: Omit<Product, 'id'>): void => {
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    products[productIndex] = { ...updatedProduct, id: productId };
    saveProducts(products);
  }
};

// Sales management
export const getSales = (): Sale[] => {
  const sales = localStorage.getItem('pos_sales');
  return sales ? JSON.parse(sales).map((sale: any) => ({
    ...sale,
    timestamp: new Date(sale.timestamp)
  })) : [];
};

export const saveSales = (sales: Sale[]): void => {
  localStorage.setItem('pos_sales', JSON.stringify(sales));
};

export const addSale = (sale: Omit<Sale, 'id' | 'timestamp'>): Sale => {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: Date.now().toString(),
    timestamp: new Date(),
  };
  
  // Update product stock
  const products = getProducts();
  sale.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
  });
  saveProducts(products);
  
  sales.push(newSale);
  saveSales(sales);
  return newSale;
};