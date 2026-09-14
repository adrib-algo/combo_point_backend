import Review from "../models/Review.js";

export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "APPROVED" }).sort({ isFeatured: -1, createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { name, rating, reviewText } = req.body;
    if (!name || !rating || !reviewText) {
      return res.status(400).json({ success: false, message: "Name, rating and review text are required" });
    }

    const review = new Review({
      name,
      rating: Math.min(5, Math.max(1, Number(rating))),
      reviewText,
      status: "PENDING",
      isFeatured: false
    });

    const saved = await review.save();
    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted for approval.",
      review: saved
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { status, isFeatured } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (status !== undefined) {
      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid review status" });
      }
      review.status = status;
    }

    if (isFeatured !== undefined) {
      review.isFeatured = Boolean(isFeatured);
    }

    const updated = await review.save();
    res.json({ success: true, review: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
