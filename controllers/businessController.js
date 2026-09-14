import Business from "../models/Business.js";

export const getBusiness = async (req, res) => {
  try {
    let business = await Business.findOne();
    if (!business) {
      business = await Business.create({});
    }
    res.json({ success: true, business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    let business = await Business.findOne();
    if (!business) {
      business = new Business();
    }

    const { bannerUrl, aboutText, physicalLocation, contactPhone, contactEmail, socialLinks } = req.body;

    if (bannerUrl !== undefined) business.bannerUrl = bannerUrl;
    if (aboutText !== undefined) business.aboutText = aboutText;
    if (physicalLocation !== undefined) business.physicalLocation = physicalLocation;
    if (contactPhone !== undefined) business.contactPhone = contactPhone;
    if (contactEmail !== undefined) business.contactEmail = contactEmail;
    if (socialLinks !== undefined) business.socialLinks = { ...business.socialLinks, ...socialLinks };

    const saved = await business.save();
    res.json({ success: true, business: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
