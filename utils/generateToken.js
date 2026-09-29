import Counter from "../models/Counter.js";

export const generateNextToken = async () => {
  let counter = await Counter.findById("orderToken");
  if (!counter) {
    counter = await Counter.create({ _id: "orderToken", seq: 100 });
  }

  const updated = await Counter.findByIdAndUpdate(
    "orderToken",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return updated.seq;
};
