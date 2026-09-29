import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import MenuItem from "./models/MenuItem.js";
import Settings from "./models/Settings.js";
import Business from "./models/Business.js";
import Review from "./models/Review.js";
import Order from "./models/Order.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    await User.deleteMany();
    await MenuItem.deleteMany();
    await Settings.deleteMany();
    await Business.deleteMany();
    await Review.deleteMany();
    await Order.deleteMany();

    await User.create({
      username: "admin",
      email: "admin@combopoint.com",
      password: "admin123",
      role: "admin"
    });
    console.log("Admin user created: admin@combopoint.com / admin123");

    await Settings.create({
      freeTasteMode: true,
      deliveryTimeEnabled: false,
      acceptOrders: true,
      storeStatus: "OPEN"
    });
    console.log("Operational Settings seeded.");

    await Business.create({
      bannerUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      aboutText: "Combo Point offers delicious, freshly prepared food combos, momos, and quick bites at New Barrackpore. Experience high quality taste with unmatched combo value!",
      physicalLocation: "New Barrackpore, near Axis Bank, opposite Monda Mithai Store",
      contactPhone: "7439709997",
      contactEmail: "combopointcafe@gmail.com",
      socialLinks: {
        facebook: "https://facebook.com/combopoint",
        instagram: "https://instagram.com/combopoint",
        whatsapp: "https://wa.me/917439709997"
      }
    });
    console.log("Business Info seeded.");

    const sampleMenuItems = [
      {
        name: "Chicken Combo Supreme",
        description: "2 Pcs Crispy Fried Chicken + Butter Naan + Chicken Gravy + Beverage (300ml)",
        price: 180,
        imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
        category: "Combos",
        isAvailable: true
      },
      {
        name: "Veg Mini Combo",
        description: "Paneer Butter Masala + 2 Parathas + Sweet Dish",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        category: "Combos",
        isAvailable: true
      },
      {
        name: "Steamed Chicken Momo (6 Pcs)",
        description: "Juicy chicken stuffed momos served with fiery red chutney & soup",
        price: 90,
        imageUrl: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80",
        category: "Momos",
        isAvailable: true
      },
      {
        name: "Fried Chicken Momo (6 Pcs)",
        description: "Crispy deep-fried chicken momos with spicy garlic mayonnaise sauce",
        price: 100,
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
        category: "Momos",
        isAvailable: true
      },
      {
        name: "Paneer Steam Momo (6 Pcs)",
        description: "Soft paneer & spiced veg filling served with homemade chutney",
        price: 80,
        imageUrl: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80",
        category: "Momos",
        isAvailable: true
      },
      {
        name: "Crispy Chicken Drumsticks (3 Pcs)",
        description: "Golden fried seasoned chicken drumsticks served with tangy dip",
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80",
        category: "Snacks",
        isAvailable: true
      },
      {
        name: "Cold Coffee Supreme",
        description: "Thick creamy chilled coffee topped with chocolate syrup",
        price: 60,
        imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
        category: "Beverages",
        isAvailable: true
      },
      {
        name: "Special Mango Shake",
        description: "Fresh Alphonso mango pulp blended with ice cream",
        price: 70,
        imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
        category: "Beverages",
        isAvailable: false
      }
    ];

    await MenuItem.insertMany(sampleMenuItems);
    console.log("Menu Items seeded.");

    await Review.insertMany([
      {
        name: "Rahul Roy",
        rating: 5,
        reviewText: "Best chicken combo near New Barrackpore! Super tasty and extremely fast delivery.",
        status: "APPROVED",
        isFeatured: true
      },
      {
        name: "Priya Sharma",
        rating: 5,
        reviewText: "The fried chicken momos are to die for! Spicy chutney is amazing.",
        status: "APPROVED",
        isFeatured: true
      },
      {
        name: "Amit Sen",
        rating: 4,
        reviewText: "Great food at affordable prices. Highly recommended food stall!",
        status: "APPROVED",
        isFeatured: false
      }
    ]);
    console.log("Sample Reviews seeded.");

    console.log("SEEDING COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
