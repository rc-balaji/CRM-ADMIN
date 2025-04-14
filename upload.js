import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC3AjgHywwV--TpcIVOBhBSXk0_DDMf8d4",
  authDomain: "crm-project-f7c2c.firebaseapp.com",
  projectId: "crm-project-f7c2c",
  storageBucket: "crm-project-f7c2c.firebasestorage.app",
  messagingSenderId: "686470505901",
  appId: "1:686470505901:web:e48e4b3788ebc0c2d0ad24",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Your existing categories data
const categories = {
  morning_food: [
    {
      id: 1,
      name: "poori",
      price: 18,
      image: "./image/poori.jpg",
      quantity: 7,
    },
    {
      id: 2,
      name: "dosai",
      price: 20,
      image: "./image/dosai.jpg",
      quantity: 9,
    },
    {
      id: 3,
      name: "spl dosai",
      price: 40,
      image: "./image/spl_dosai.jpg",
      quantity: 6,
    },
  ],
  lunch: [
    {
      id: 1,
      name: "chappathi",
      price: 18,
      image: "./image/chappathi.jpg",
      quantity: 8,
    },
    {
      id: 2,
      name: "porota",
      price: 18,
      image: "./image/porota.jpg",
      quantity: 5,
    },
    {
      id: 3,
      name: "kothu porotta",
      price: 80,
      image: "./image/kothu_porotta.jpg",
      quantity: 10,
    },
    {
      id: 4,
      name: "meals",
      price: 70,
      image: "./image/meals.jpg",
      quantity: 6,
    },
  ],
  snacks: [
    {
      id: 1,
      name: "sambar vadai",
      price: 15,
      image: "./image/sambar_vadai.jpg",
      quantity: 4,
    },
    {
      id: 2,
      name: "curd vadai",
      price: 20,
      image: "./image/curd_vadai.jpg",
      quantity: 7,
    },
    {
      id: 3,
      name: "plain sandwich",
      price: 30,
      image: "./image/plain_sandwich.jpg",
      quantity: 9,
    },
    {
      id: 4,
      name: "happy happy",
      price: 5,
      image: "./image/happy_happy.jpg",
      quantity: 6,
    },
  ],
  chocolate: [
    {
      id: 1,
      name: "five star",
      price: 5,
      image: "./image/five_star.jpg",
      quantity: 10,
    },
    {
      id: 3,
      name: "dairy milk",
      price: 5,
      image: "./image/dairy_milk.jpg",
      quantity: 8,
    },
    {
      id: 4,
      name: "dairy milk crackle",
      price: 45,
      image: "./image/dairy_milk_crackle.jpg",
      quantity: 5,
    },
  ],
  drink: [
    { id: 1, name: "Tea", price: 12, image: "./image/Tea.jpg", quantity: 9 },
    {
      id: 3,
      name: "coffee",
      price: 18,
      image: "./image/coffee.jpg",
      quantity: 7,
    },
    {
      id: 4,
      name: "badam milk",
      price: 30,
      image: "./image/badam_milk.jpg",
      quantity: 4,
    },
  ],
};

// Uploading all items to Firestore
const uploadAllMenuItems = async () => {
  try {
    for (const [category, items] of Object.entries(categories)) {
      for (const item of items) {
        await addDoc(collection(db, "menuItems"), {
          name: item.name,
          price: item.price,
          image: item.image,
          category: category,
        });
        console.log(`Added ${item.name} to ${category}`);
      }
    }
    console.log("✅ All items added successfully!");
  } catch (error) {
    console.error("❌ Error adding items:", error);
  }
};

// Run it once
uploadAllMenuItems();
