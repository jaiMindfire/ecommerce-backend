import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index";
import { User } from "../models/User";
import { Product } from "../models/Product";
import connectDB from "../config/database";

let mongoServer: MongoMemoryServer;
let token: string;

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
});

describe("Authentication & Product Cart Flow", () => {
  it("should log in a user and return a token", async () => {
    // First register a user
    await request(app).post("/api/auth/register").send({
      username: "Jai Bajpai",
      email: "jai@example.com",
      password: "password123",
    });

    // Now log in the user
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "jai@example.com",
        password: "password123",
      })
      .expect(200);
    console.log(res.body, "dd");
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    console.log(res.body);
    token = res.body.token;
  });

  it("should allow adding products to the cart with authentication", async () => {
    // First create a product
    const product = await Product.create({
      name: "Test Product",
      price: 100,
      description: "A test product",
      stock: 10,
      imageUrl:
        "https://images.samsung.com/is/image/samsung/in-full-hd-tv-te50fa-ua43te50fakxxl-frontblack-231881877?$650_519_PNG$",
    });

    // Now, attempt to add the product to the cart (protected route)
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product._id,
        quantity: 2,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.cart.items[0].product._id.toString()).toBe(
      product._id.toString()
    );
    expect(res.body.cart.items[0].quantity).toBe(2);
  });

  it("should prevent adding products to the cart without authentication", async () => {
    // Create a product
    const product = await Product.create({
      name: "Test Product",
      price: 100,
      description: "A test product",
      stock: 10,
      imageUrl:
        "https://images.samsung.com/is/image/samsung/in-full-hd-tv-te50fa-ua43te50fakxxl-frontblack-231881877?$650_519_PNG$",
    });

    // Try to add product to cart without authentication
    await request(app)
      .post("/api/cart")
      .send({
        productId: product._id,
        quantity: 1,
      })
      .expect(401); // Expect Unauthorized

    // No token is provided, so it should fail
  });

  it("should return paginated products", async () => {
    // Insert mock products into the database
    const mockProducts = [
      {
        name: "Product 1",
        price: 100,
        description: "Product 1 description",
        stock: 10,
        imageUrl:
          "https://images.samsung.com/is/image/samsung/in-full-hd-tv-te50fa-ua43te50fakxxl-frontblack-231881877?$650_519_PNG$",
      },
      {
        name: "Product 2",
        price: 200,
        description: "Product 2 description",
        stock: 10,
        imageUrl:
          "https://images.samsung.com/is/image/samsung/in-full-hd-tv-te50fa-ua43te50fakxxl-frontblack-231881877?$650_519_PNG$",
      },
      {
        name: "Product 3",
        price: 300,
        stock: 10,
        description: "Product 3 description",
        imageUrl:
          "https://images.samsung.com/is/image/samsung/in-full-hd-tv-te50fa-ua43te50fakxxl-frontblack-231881877?$650_519_PNG$",
      },
    ];

    await Product.insertMany(mockProducts);

    // Make the request to the API with pagination params
    const res = await request(app)
      .get("/api/products")
      .query({ page: 1, limit: 2 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2); // Only 2 products should be returned
    expect(res.body.pagination.totalItems).toBe(3); // Total items in DB should be 3
    expect(res.body.pagination.totalPages).toBe(2); // Total pages should be 2
    expect(res.body.pagination.currentPage).toBe(1); // Current page should be 1
  });
});
