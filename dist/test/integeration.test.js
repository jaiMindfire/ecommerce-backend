"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../src/index");
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const database_1 = require("src/config/database");
const redis_1 = require("src/config/redis");
let mongoServer;
let token;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.connectDB)();
    yield Product_1.Product.deleteMany({});
    yield User_1.User.deleteOne({ email: "jai@example.com" });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.closeDB)();
    yield (0, redis_1.closeRedis)();
    index_1.server.close();
}));
describe("Authentication & Product Cart Flow", () => {
    it("should log in a user and return a token", () => __awaiter(void 0, void 0, void 0, function* () {
        // First register a user
        yield (0, supertest_1.default)(index_1.app).post("/api/auth/register").send({
            username: "Jai Bajpai",
            email: "jai@example.com",
            password: "password123",
        });
        // Now log in the user
        const res = yield (0, supertest_1.default)(index_1.app)
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
    }));
    it("should allow adding products to the cart with authentication", () => __awaiter(void 0, void 0, void 0, function* () {
        // First create a product
        const product = yield Product_1.Product.create({
            name: "Test Product",
            price: 100,
            description: "A test product",
            rating: "4",
            category: "test",
            stock: 10,
            imageUrl: "https://images.samsung.com/is/image/samsung/in-full-hd-tv-te50fa-ua43te50fakxxl-frontblack-231881877?$650_519_PNG$",
        });
        // Now, attempt to add the product to the cart (protected route)
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({
            productId: product._id,
            quantity: 2,
        })
            .expect(200);
        expect(res.body.success).toBe(true);
        expect(res.body.cart.items.length).toBe(1);
        expect(res.body.cart.items[0].product._id.toString()).toBe(product._id.toString());
        expect(res.body.cart.items[0].quantity).toBe(2);
    }));
    it("should prevent adding products to the cart without authentication", () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a product
        const product = yield Product_1.Product.create({
            name: "Test Product",
            price: 100,
            description: "A test product",
            rating: "4",
            category: "test",
            stock: 10,
            imageUrl: "https://images.samsung.com/is/image/samsung/in-full-hd-tv-te50fa-ua43te50fakxxl-frontblack-231881877?$650_519_PNG$",
        });
        // Try to add product to cart without authentication
        yield (0, supertest_1.default)(index_1.app)
            .post("/api/cart")
            .send({
            productId: product._id,
            quantity: 1,
        })
            .expect(401); // Expect Unauthorized
        // No token is provided, so it should fail
    }));
    it("should return paginated products", () => __awaiter(void 0, void 0, void 0, function* () {
        // Insert mock products into the database
        const mockProducts = [
            {
                name: 'Samsung 50" 4K UHD Smart TV',
                price: 499.99,
                description: "Experience vivid colors and stunning clarity with this Samsung 50-inch 4K UHD Smart TV.",
                stock: 50,
                imageUrl: "https://images.samsung.com/is/image/samsung/p6pim/in/ua50cu7700klxl/gallery/in-crystal-uhd-cu7000-ua50cu7700klxl-535859786?$650_519_PNG$",
                category: "Electronics",
                rating: 3.5,
            },
            {
                name: "Apple AirPods Pro",
                price: 249.0,
                description: "Active Noise Cancellation for immersive sound. Transparency mode for hearing the world around you.",
                stock: 150,
                imageUrl: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/airpods-pro-2-hero-select-202409_FV1_FMT_WHH?wid=752&hei=636&fmt=jpeg&qlt=90&.v=1725492498882",
                category: "Wearables",
                rating: 1.8,
            },
            {
                name: "Sony WH-1000XM4 Headphones",
                price: 349.99,
                description: "Industry-leading noise cancellation and superior sound quality.",
                stock: 75,
                imageUrl: "https://www.sony.co.in/image/5d02da5df552836db894cead8a68f5f3?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF",
                category: "Wearables",
                rating: 2.7,
            },
            {
                name: "Dell XPS 13 Laptop",
                price: 999.99,
                description: "Ultra-thin and lightweight laptop with a stunning display and powerful performance.",
                stock: 30,
                imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2cQwstUj0Kmwg6aFZL8hBYoawo3e6frmYHg&s",
                category: "Laptops",
                rating: 3.6,
            },
            {
                name: "Fitbit Charge 5",
                price: 179.95,
                description: "Fitness tracker with built-in GPS and stress management tools.",
                stock: 100,
                imageUrl: "https://www.fitbit.com/global/content/dam/fitbit/global/pdp/devices/charge-5/images/desktop/features-cover-charge5-21.jpg",
                category: "Wearables",
                rating: 2.4,
            },
            {
                name: "Canon EOS Rebel T7 DSLR Camera",
                price: 499.0,
                description: "Beginner-friendly DSLR camera with built-in Wi-Fi and Full HD video.",
                stock: 40,
                imageUrl: "https://m.media-amazon.com/images/I/71Is-Zv6A0L._AC_SX679_.jpg",
                category: "Cameras",
                rating: 4.2,
            },
            {
                name: "Samsung Galaxy S21",
                price: 799.99,
                description: "5G smartphone with a stunning display and powerful camera capabilities.",
                stock: 60,
                imageUrl: "https://images-cdn.ubuy.co.in/65e052459f1bf005e26a62a7-samsung-galaxy-s21-5g-g996u-128gb.jpg",
                category: "Smartphones",
                rating: 4.6,
            },
            {
                name: "Amazon Echo Dot (4th Gen)",
                price: 49.99,
                description: "Smart speaker with Alexa to control your smart home.",
                stock: 200,
                imageUrl: "https://m.media-amazon.com/images/I/81WaomQESKL._AC_UF894,1000_QL80_.jpg",
                category: "Smart Home Devices",
                rating: 4.3,
            },
            {
                name: "JBL Charge 5 Portable Speaker",
                price: 179.95,
                description: "Powerful sound with deep bass, perfect for outdoor activities.",
                stock: 85,
                imageUrl: "https://www.vplak.com/images/jbl/JBL-CHARGE-5/black/image-1.jpg",
                category: "Speakers",
                rating: 4.5,
            },
            {
                name: "GoPro HERO10 Black",
                price: 399.99,
                description: "Capture incredible moments in stunning 5.3K video.",
                stock: 45,
                imageUrl: "https://m.media-amazon.com/images/I/61A31TlXnuL._AC_UF1000,1000_QL80_.jpg",
                category: "Cameras",
                rating: 1.7,
            },
            {
                name: "Nikon D3500 DSLR Camera",
                price: 499.95,
                description: "Lightweight DSLR with 24.2 MP sensor and easy-to-use features.",
                stock: 35,
                imageUrl: "https://rukminim2.flixcart.com/image/850/1000/jmjhifk0/dslr-camera/f/g/t/na-d3500-nikon-original-imaf9fkfv5xqdheq.jpeg?q=20&crop=false",
                category: "Cameras",
                rating: 4.3,
            },
            {
                name: "Apple Watch Series 7",
                price: 399.0,
                description: "Stay connected and healthy with the latest Apple Watch.",
                stock: 120,
                imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAML-SZB3WrH_uffWnDTD7KMMVxDTXbrySjg&s",
                category: "Wearables",
                rating: 4.8,
            },
            {
                name: "Microsoft Surface Pro 7",
                price: 749.99,
                description: "Versatile 2-in-1 laptop with a powerful Intel processor.",
                stock: 25,
                imageUrl: "https://news.microsoft.com/wp-content/uploads/prod/sites/45/2021/02/microsoft-surface-pro-7-plus-1.jpg",
                category: "Laptops",
                rating: 4.7,
            },
            {
                name: "Razer DeathAdder V2 Gaming Mouse",
                price: 69.99,
                description: "Ergonomic gaming mouse with customizable RGB lighting.",
                stock: 150,
                imageUrl: "https://www.pcstudio.in/wp-content/uploads/2022/09/Razer-DeathAdder-V2-X-HyperSpeed-Wireless-Gaming-Mouse-Black-1.webp",
                category: "Gaming",
                rating: 4.4,
            },
            {
                name: "HP Envy 13 Laptop",
                price: 849.99,
                description: "Sleek laptop with powerful performance and stunning display.",
                stock: 20,
                imageUrl: "https://m.media-amazon.com/images/I/71N9fpppW8L.jpg",
                category: "Laptops",
                rating: 4.6,
            },
            {
                name: "Oculus Quest 2 VR Headset",
                price: 299.0,
                description: "All-in-one VR headset with a library of immersive games and experiences.",
                stock: 90,
                imageUrl: "https://images-cdn.ubuy.co.in/65e6ac9c2c174f351c1311f6-oculus-quest-2-advanced-all-in-one.jpg",
                category: "Gaming",
                rating: 2.8,
            },
        ];
        yield Product_1.Product.insertMany(mockProducts);
        // Make the request to the API with pagination params
        const res = yield (0, supertest_1.default)(index_1.app)
            .get("/api/products")
            .query({ page: 1, limit: 2 })
            .expect(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(2); // Only 2 products should be returned
        expect(res.body.pagination.currentPage).toBe(1); // Current page should be 1
    }));
});
