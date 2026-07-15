import { Location } from './location.model.js';

const DEFAULT_LOCATIONS = ['Bali Main', 'Bali Airport', 'Bali Test'];

export async function seedLocations() {
  for (const name of DEFAULT_LOCATIONS) {
    await Location.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
}

export async function listLocations(req, res) {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createLocation(req, res) {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Location name is required' });
    }

    const existing = await Location.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'Location already exists', location: existing });
    }

    const location = await Location.create({ name });
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
