require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Table = require('../models/Table');
const TableStatus = require('../models/TableStatus');
const MenuItem = require('../models/MenuItem');
const InventoryItem = require('../models/InventoryItem');

const demoTables = [
  { tableNumber: 1, capacity: 2, zone: 'window', positionX: 0, positionY: 0 },
  { tableNumber: 2, capacity: 2, zone: 'indoor', positionX: 1, positionY: 0 },
  { tableNumber: 3, capacity: 4, zone: 'indoor', positionX: 2, positionY: 0 },
  { tableNumber: 4, capacity: 4, zone: 'indoor', positionX: 3, positionY: 0 },
  { tableNumber: 5, capacity: 4, zone: 'outdoor', positionX: 0, positionY: 1 },
  { tableNumber: 6, capacity: 6, zone: 'outdoor', positionX: 1, positionY: 1 },
  { tableNumber: 7, capacity: 6, zone: 'private', positionX: 2, positionY: 1 },
  { tableNumber: 8, capacity: 4, zone: 'bar', positionX: 3, positionY: 1 },
  { tableNumber: 9, capacity: 8, zone: 'private', positionX: 0, positionY: 2 },
  { tableNumber: 10, capacity: 2, zone: 'bar', positionX: 1, positionY: 2 },
];

// Menu data was previously missing entirely from the seed script, which is
// why a freshly-set-up database showed an empty Menu page - there was
// simply nothing in the MenuItem collection for GET /api/menu to return.
const demoMenu = [
  { name: 'Paneer Biryani', description: 'Fragrant basmati rice layered with spiced paneer and saffron.', price: 249, category: 'mains', tags: ['veg', 'bestseller', 'spicy'] },
  { name: 'Chicken Biryani', description: 'Slow-cooked basmati rice with marinated chicken and whole spices.', price: 289, category: 'mains', tags: ['non-veg', 'bestseller'] },
  { name: 'Butter Chicken', description: 'Tandoori chicken simmered in a creamy tomato-butter gravy.', price: 309, category: 'mains', tags: ['non-veg'] },
  { name: 'Paneer Tikka Masala', description: 'Grilled paneer cubes in a rich onion-tomato masala.', price: 259, category: 'mains', tags: ['veg', 'spicy'] },
  { name: 'Veg Hakka Noodles', description: 'Stir-fried noodles with crunchy vegetables and soy.', price: 189, category: 'mains', tags: ['veg'] },
  { name: 'Margherita Pizza', description: 'Classic pizza with tomato, mozzarella and fresh basil.', price: 279, category: 'mains', tags: ['veg', 'bestseller'] },
  { name: 'Garlic Bread', description: 'Toasted bread loaded with garlic butter and herbs.', price: 129, category: 'appetizers', tags: ['veg'] },
  { name: 'Chicken 65', description: 'Spicy deep-fried chicken bites, South Indian style.', price: 219, category: 'appetizers', tags: ['non-veg', 'spicy'] },
  { name: 'Veg Spring Rolls', description: 'Crispy rolls stuffed with julienned vegetables.', price: 159, category: 'appetizers', tags: ['veg'] },
  { name: 'Paneer 65', description: 'Crispy fried paneer tossed in a tangy spiced sauce.', price: 199, category: 'appetizers', tags: ['veg', 'spicy'] },
  { name: 'Tandoori Momos', description: 'Steamed momos finished on the tandoor with smoky spices.', price: 179, category: 'appetizers', tags: ['veg', 'spicy'] },
  { name: 'Gulab Jamun', description: 'Warm milk-solid dumplings soaked in rose-cardamom syrup.', price: 99, category: 'desserts', tags: ['veg', 'bestseller'] },
  { name: 'Chocolate Brownie', description: 'Fudgy brownie served warm with a scoop of vanilla ice cream.', price: 139, category: 'desserts', tags: ['veg'] },
  { name: 'Masala Chai', description: 'Spiced Indian tea brewed with milk.', price: 49, category: 'beverages', tags: ['veg'] },
  { name: 'Cold Coffee', description: 'Chilled blended coffee topped with ice cream.', price: 119, category: 'beverages', tags: ['veg', 'bestseller'] },
  { name: 'Coke', description: 'Chilled 300ml soft drink.', price: 60, category: 'beverages', tags: ['veg'] },
  { name: 'Fresh Lime Soda', description: 'Sweet, salted or plain - your choice.', price: 79, category: 'beverages', tags: ['veg'] },
];

const demoInventory = [
  { name: 'Basmati Rice', unit: 'kg', quantityAvailable: 40, alertThreshold: 10, supplier: { name: 'Annapurna Traders', contact: '9876500001' } },
  { name: 'Paneer', unit: 'kg', quantityAvailable: 12, alertThreshold: 5, supplier: { name: 'Fresh Dairy Co.', contact: '9876500002' } },
  { name: 'Chicken', unit: 'kg', quantityAvailable: 25, alertThreshold: 8, supplier: { name: 'Farm Fresh Poultry', contact: '9876500003' } },
  { name: 'Milk', unit: 'L', quantityAvailable: 10, alertThreshold: 15, supplier: { name: 'Fresh Dairy Co.', contact: '9876500002' } },
  { name: 'Tomatoes', unit: 'kg', quantityAvailable: 18, alertThreshold: 6, supplier: { name: 'Green Valley Produce', contact: '9876500004' } },
  { name: 'Cheese', unit: 'kg', quantityAvailable: 6, alertThreshold: 4, supplier: { name: 'Fresh Dairy Co.', contact: '9876500002' } },
];

async function seed() {
  await connectDB();

  await Table.deleteMany({});
  await TableStatus.deleteMany({});
  await MenuItem.deleteMany({});
  await InventoryItem.deleteMany({});

  const tables = await Table.insertMany(demoTables);

  const statuses = tables.map((table, i) => ({
    table: table._id,
    // give a mix of live states so the floor map/optimizer demo looks real
    status: ['available', 'occupied', 'reserved', 'cleaning'][i % 4],
    currentParty:
      i % 4 === 1
        ? { size: Math.min(table.capacity, 2), seatedAt: new Date(Date.now() - 25 * 60000) }
        : { size: 0, seatedAt: null },
    diningHistoryMin: [55, 62, 58, 70, 60],
  }));

  await TableStatus.insertMany(statuses);
  const menuItems = await MenuItem.insertMany(demoMenu);
  const inventoryItems = await InventoryItem.insertMany(demoInventory);

  console.log(`Seeded ${tables.length} tables with live statuses.`);
  console.log(`Seeded ${menuItems.length} menu items.`);
  console.log(`Seeded ${inventoryItems.length} inventory items.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
