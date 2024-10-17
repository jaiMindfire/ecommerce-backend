"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on("message", (data) => {
    if (data.type === "filterItems") {
        const { existingProductIds, newItems } = data.payload;
        // Filter new items that are not already in the cart
        const filteredItems = newItems.filter((item) => !existingProductIds.includes(item.product._id));
        // Return the filtered items to the main thread
        worker_threads_1.parentPort.postMessage({ type: "filteredItems", payload: filteredItems });
    }
    else if (data.type === "bulkOperations") {
        const { cartItems, products } = data.payload;
        const bulkOperations = [];
        // Construct bulk operations for product stock update
        for (const cartItem of cartItems) {
            const product = products.find((p) => p._id.toString() === cartItem.product.toString());
            if (product) {
                bulkOperations.push({
                    updateOne: {
                        filter: { _id: product._id },
                        update: { $inc: { stock: -cartItem.quantity } },
                    },
                });
            }
        }
        // Return the bulk operations to the main thread
        worker_threads_1.parentPort.postMessage({
            type: "bulkOperations",
            payload: bulkOperations,
        });
    }
});
