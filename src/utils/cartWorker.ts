import { parentPort } from "worker_threads";

// Define the expected structure of the messages
interface FilterItemsMessage {
  type: "filterItems";
  payload: {
    existingProductIds: string[]; // Assuming product IDs are strings
    newItems: { product: { _id: string } }[]; // Adjust the type as necessary
  };
}

interface BulkOperationsMessage {
  type: "bulkOperations";
  payload: {
    cartItems: { product: string; quantity: number }[]; // Adjust types as necessary
    products: { _id: string; stock: number }[]; // Adjust types as necessary
  };
}

type IncomingMessage = FilterItemsMessage | BulkOperationsMessage;

parentPort?.on("message", (data: IncomingMessage) => {
  if (data.type === "filterItems") {
    const { existingProductIds, newItems } = data.payload;

    // Filter new items that are not already in the cart
    const filteredItems = newItems.filter(
      (item) => !existingProductIds.includes(item.product._id)
    );

    // Return the filtered items to the main thread
    parentPort!.postMessage({ type: "filteredItems", payload: filteredItems });
  } else if (data.type === "bulkOperations") {
    const { cartItems, products } = data.payload;
    const bulkOperations: {
      updateOne: {
        filter: { _id: string };
        update: { $inc: { stock: number } };
      };
    }[] = [];

    // Construct bulk operations for product stock update
    for (const cartItem of cartItems) {
      const product = products.find(
        (p) => p._id.toString() === cartItem.product.toString()
      );

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
    parentPort!.postMessage({
      type: "bulkOperations",
      payload: bulkOperations,
    });
  }
});
