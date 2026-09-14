import MenuItem from "../models/MenuItem.js";

export const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({}).sort({ category: 1, createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, isAvailable } = req.body;
    if (!name || !description || price === undefined || !imageUrl) {
      return res.status(400).json({ success: false, message: "Missing required menu item fields" });
    }

    const item = new MenuItem({
      name,
      description,
      price: Number(price),
      imageUrl,
      category: category || "Combos",
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    const saved = await item.save();
    res.status(201).json({ success: true, item: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const { name, description, price, imageUrl, category, isAvailable } = req.body;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = Number(price);
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (category !== undefined) item.category = category;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    const updated = await item.save();
    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    res.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
