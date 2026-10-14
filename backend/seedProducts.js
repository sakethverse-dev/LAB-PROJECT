import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.model.js';
import { connectDB } from './config/db.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Mechanical RGB Gaming Keyboard',
    description: 'Customizable RGB backlighting with tactile blue mechanical switches, anti-ghosting, and aircraft-grade aluminum top plate.',
    price: 3499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60',
    stock: 24,
  },
  {
    name: 'Wireless Active Noise Cancelling Headphones',
    description: 'High-fidelity audio with hybrid ANC, 40-hour battery life, ultra-plush memory foam earcups, and dual microphone clarity.',
    price: 6999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
    stock: 15,
  },
  {
    name: 'Ultra HD 4K IPS Ergonomic Monitor',
    description: '27-inch 4K IPS display with 99% sRGB color gamut, USB-C 65W power delivery, and fully adjustable pivot stand.',
    price: 24999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60',
    stock: 8,
  },
  {
    name: 'Premium Leather Minimalist Backpack',
    description: 'Handcrafted full-grain leather backpack with dedicated 16-inch laptop compartment and weather-resistant zippers.',
    price: 4599,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60',
    stock: 18,
  },
  {
    name: 'Classic Chronograph Stainless Steel Watch',
    description: 'Sapphire crystal glass, precision Japanese quartz movement, 50M water resistance with interchangeable mesh bracelet.',
    price: 5299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
    stock: 12,
  },
  {
    name: 'Slim-Fit Organic Cotton Oxford Shirt',
    description: '100% GOTS certified organic combed cotton, breathable weave, button-down collar, perfect for work or casual weekends.',
    price: 1899,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=60',
    stock: 35,
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'The definitive guide to the architecture of reliable, scalable, and maintainable systems by Martin Kleppmann.',
    price: 1499,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60',
    stock: 50,
  },
  {
    name: 'Clean Code: A Handbook of Agile Craftsmanship',
    description: 'Legendary software engineering principles by Robert C. Martin on writing elegant, readable, and testable code.',
    price: 1299,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=60',
    stock: 40,
  },
  {
    name: 'Smart Ceramic Aroma Diffuser & Humidifier',
    description: 'Ultrasonic whisper-quiet mist technology with 7 soothing ambient LED colors and auto shut-off sensor.',
    price: 2199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=60',
    stock: 22,
  },
  {
    name: 'Artisan Pour-Over Glass Coffee Dripper Set',
    description: 'Heat-resistant borosilicate glass server with laser-etched reusable stainless steel micro-filter for barista-level brew.',
    price: 1799,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=60',
    stock: 16,
  },
  {
    name: 'Ergonomic Memory Foam Lumbar Support Cushion',
    description: 'Orthopedic contoured design engineered for long work sessions, featuring 3D breathable mesh washable cover.',
    price: 1399,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=60',
    stock: 30,
  },
  {
    name: 'Wireless Fast Charging Desk Pad',
    description: 'Dual-purpose vegan leather desk mat with integrated 15W Qi wireless fast charger and non-slip suede base.',
    price: 2499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1616353071588-708dcff912e2?w=800&auto=format&fit=crop&q=60',
    stock: 20,
  },
];

export const seedCatalog = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial product catalog...');
      await Product.insertMany(sampleProducts);
      console.log(`✅ Successfully seeded ${sampleProducts.length} sample products!`);
    } else {
      console.log(`ℹ️ Product catalog already populated (${count} products).`);
    }
  } catch (err) {
    console.error('❌ Error during product seeding:', err.message);
  }
};

// If run directly via node seedProducts.js
if (process.argv[1]?.endsWith('seedProducts.js')) {
  (async () => {
    await connectDB();
    await Product.deleteMany({});
    console.log('🧹 Cleared existing products.');
    await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${sampleProducts.length} products successfully!`);
    process.exit(0);
  })();
}
