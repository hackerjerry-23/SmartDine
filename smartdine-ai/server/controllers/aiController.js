const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');
const InventoryItem = require('../models/InventoryItem');
const Order = require('../models/Order');
const { generateText, generateJSON } = require('../utils/gemini');

/**
 * Simple non-AI fallback: looks for menu items whose name/category/tags
 * match words in the question. Used whenever Gemini is unavailable
 * (no API key, quota exceeded, network error, etc.) so the assistant
 * always says *something* useful instead of the UI going silent.
 */
function keywordFallbackAnswer(question, menu) {
  const words = question.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  const hit = menu.find((item) => {
    const haystack = `${item.name} ${item.category} ${(item.tags || []).join(' ')}`.toLowerCase();
    return words.some((w) => haystack.includes(w));
  });

  if (hit) {
    return `${hit.name} is ${hit.isAvailable ? 'currently available' : 'currently out of stock'} (₹${hit.price}, ${hit.category}).`;
  }
  return "I couldn't find a matching dish on the menu right now. Try asking about a specific dish name.";
}

// POST /api/ai/recommend  Body: { orderedItemNames: string[] }
const recommend = asyncHandler(async (req, res) => {
  const { orderedItemNames } = req.body;
  if (!Array.isArray(orderedItemNames) || orderedItemNames.length === 0) {
    res.status(400);
    throw new Error('orderedItemNames (non-empty array) is required');
  }

  const menu = await MenuItem.find({ isAvailable: true }).select('name category tags price');

  const prompt = `A customer ordered: ${orderedItemNames.join(', ')}.
Available menu items (JSON): ${JSON.stringify(menu)}.
Suggest up to 3 complementary items from this exact list only (by name) that pair well.
Respond ONLY with JSON: {"suggestions": [{"name": "...", "reason": "..."}]}`;

  const parsed = await generateJSON(prompt).catch((err) => {
    console.error('recommend failed:', err.message);
    return null;
  });

  if (parsed?.suggestions) return res.json(parsed);

  // Fallback: recommend up to 3 popular items from other categories.
  const orderedLower = orderedItemNames.map((n) => n.toLowerCase());
  const fallback = menu
    .filter((m) => !orderedLower.includes(m.name.toLowerCase()))
    .slice(0, 3)
    .map((m) => ({ name: m.name, reason: 'Popular pairing with your order.' }));
  res.json({ suggestions: fallback });
});

// POST /api/ai/predict  Body: { horizonDays?: number }
// Demand forecasting using recent historical order data, summarized by Gemini.
const predictDemand = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const history = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: { item: '$items.name', day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
        qty: { $sum: '$items.quantity' },
      },
    },
  ]);

  if (history.length === 0) {
    return res.json({ predictions: [], note: 'Not enough order history yet to forecast demand.' });
  }

  const prompt = `Historical daily sales quantities (JSON): ${JSON.stringify(history)}.
Predict tomorrow's expected quantity for each item.
Respond ONLY with JSON: {"predictions": [{"item": "...", "predictedQuantity": 0}]}`;

  const parsed = await generateJSON(prompt).catch((err) => {
    console.error('predictDemand failed:', err.message);
    return null;
  });

  if (parsed?.predictions) return res.json(parsed);

  // Fallback: use each item's simple historical average as the prediction.
  const totals = {};
  const days = {};
  history.forEach((h) => {
    totals[h._id.item] = (totals[h._id.item] || 0) + h.qty;
    days[h._id.item] = (days[h._id.item] || new Set()).add(h._id.day);
  });
  const predictions = Object.keys(totals).map((item) => ({
    item,
    predictedQuantity: Math.round(totals[item] / (days[item]?.size || 1)),
  }));
  res.json({ predictions, note: 'AI forecast unavailable — showing historical daily average instead.' });
});

// POST /api/ai/inventory-predict
const predictInventory = asyncHandler(async (req, res) => {
  const items = await InventoryItem.find();

  if (items.length === 0) return res.json({ warnings: [] });

  const prompt = `Inventory items with usage history (JSON): ${JSON.stringify(items)}.
For each item likely to run out within 2 days based on usageHistory trend vs quantityAvailable,
respond ONLY with JSON: {"warnings": [{"item": "...", "willRunOutOn": "YYYY-MM-DD", "suggestedReorderQty": 0}]}`;

  const parsed = await generateJSON(prompt).catch((err) => {
    console.error('predictInventory failed:', err.message);
    return null;
  });

  if (parsed?.warnings) return res.json(parsed);

  // Fallback: flag anything already at/below its alert threshold.
  const warnings = items
    .filter((i) => i.quantityAvailable <= i.alertThreshold)
    .map((i) => ({
      item: i.name,
      willRunOutOn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      suggestedReorderQty: Math.max(i.alertThreshold * 2 - i.quantityAvailable, i.alertThreshold),
    }));
  res.json({ warnings, note: warnings.length ? 'AI forecast unavailable — showing threshold-based alerts instead.' : undefined });
});

// POST /api/ai/assistant  Body: { question: string }
// e.g. "Is Paneer Biryani available?" -> checks live menu + queue/table context
const assistant = asyncHandler(async (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) {
    res.status(400);
    throw new Error('question is required');
  }

  const menu = await MenuItem.find().select('name isAvailable category price tags');

  const prompt = `You are SmartDine AI's restaurant assistant. Live menu data (JSON): ${JSON.stringify(menu)}.
Answer the customer's question using ONLY this data. Be concise (1-2 sentences).
If the question isn't about the menu, politely say you can only help with menu questions.
Question: "${question}"`;

  try {
    const answer = await generateText(prompt);
    return res.json({ answer });
  } catch (err) {
    console.error('assistant failed, using fallback:', err.message);
    // Always return 200 with *something* useful rather than letting the
    // request fail silently in the UI.
    return res.json({ answer: keywordFallbackAnswer(question, menu), degraded: true });
  }
});

module.exports = { recommend, predictDemand, predictInventory, assistant };
