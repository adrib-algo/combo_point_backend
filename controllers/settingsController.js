import Settings from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const { freeTasteMode, deliveryTimeEnabled, acceptOrders, storeStatus } = req.body;

    if (freeTasteMode !== undefined) settings.freeTasteMode = Boolean(freeTasteMode);
    if (deliveryTimeEnabled !== undefined) settings.deliveryTimeEnabled = Boolean(deliveryTimeEnabled);
    if (acceptOrders !== undefined) settings.acceptOrders = Boolean(acceptOrders);
    if (storeStatus !== undefined) {
      if (!["OPEN", "CLOSED"].includes(storeStatus)) {
        return res.status(400).json({ success: false, message: "Invalid storeStatus value" });
      }
      settings.storeStatus = storeStatus;
    }

    const saved = await settings.save();
    res.json({ success: true, settings: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
