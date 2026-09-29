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
    const updateData = {};
    const {
      freeTasteMode,
      deliveryTimeEnabled,
      acceptOrders,
      storeStatus,
      mainOrderMode,
      preOrderAdvanceHours,
      minimumPrepHours,
      freeTasteMaxPerPhone
    } = req.body;

    if (freeTasteMode !== undefined) updateData.freeTasteMode = Boolean(freeTasteMode);
    if (deliveryTimeEnabled !== undefined) updateData.deliveryTimeEnabled = Boolean(deliveryTimeEnabled);
    if (acceptOrders !== undefined) updateData.acceptOrders = Boolean(acceptOrders);
    if (storeStatus !== undefined) {
      if (!["OPEN", "CLOSED"].includes(storeStatus)) {
        return res.status(400).json({ success: false, message: "Invalid storeStatus value" });
      }
      updateData.storeStatus = storeStatus;
    }
    if (mainOrderMode !== undefined) {
      if (!["PRE-ORDER", "INSTANT"].includes(mainOrderMode)) {
        return res.status(400).json({ success: false, message: "Invalid mainOrderMode value" });
      }
      updateData.mainOrderMode = mainOrderMode;
    }
    if (preOrderAdvanceHours !== undefined) updateData.preOrderAdvanceHours = Number(preOrderAdvanceHours) || 24;
    if (minimumPrepHours !== undefined) updateData.minimumPrepHours = Number(minimumPrepHours) || 1;
    if (freeTasteMaxPerPhone !== undefined) updateData.freeTasteMaxPerPhone = Number(freeTasteMaxPerPhone) || 1;

    // Use findOneAndUpdate with upsert to guarantee singleton settings persistence
    const saved = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, settings: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
