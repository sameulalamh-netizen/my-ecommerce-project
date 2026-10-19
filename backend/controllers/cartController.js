const Cart = require("../model/Cart");
const Product = require("../model/product");
const Shop = require("../model/Shop");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required"
      });
    }

    const productQuantity = Number(quantity);

    if (
      isNaN(productQuantity) ||
      productQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    // Product খুঁজে বের করা
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Stock check
    if (product.stock < productQuantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available"
      });
    }

    // Product-এর shop খুঁজে বের করা
    const shop = await Shop.findById(product.shop);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found"
      });
    }

    // Customer-এর Cart খুঁজে বের করা
    let cart = await Cart.findOne({
      user: req.user.userId
    });

    // Cart না থাকলে নতুন Cart
    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        items: [
          {
            product: productId,
            shop: shop._id,
            quantity: productQuantity
          }
        ]
      });

      return res.status(201).json({
        success: true,
        message: "Product added to cart",
        data: cart
      });
    }

    // Product আগে Cart-এ আছে কিনা
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() ===
        productId.toString()
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + productQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock available"
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        shop: shop._id,
        quantity: productQuantity
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: cart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
      error: error.message
    });
  }
};

const getMyCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId
    })
      .populate(
        "items.product",
        "name price stock image category"
      )
      .populate(
        "items.shop",
        "name logo"
      );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: {
          items: [],
          total: 0
        }
      });
    }

    let total = 0;

    const cartItems = cart.items.map((item) => {
      const amount = item.product.price * item.quantity;

      total += amount;

      let stockStatus = "In Stock";

      if (item.product.stock === 0) {
        stockStatus = "Out of Stock";
      } else if (item.quantity > item.product.stock) {
        stockStatus = "Insufficient Stock";
      } else if (item.product.stock <= 5) {
        stockStatus = "Low Stock";
      }

      return {
        product: item.product,
        shop: item.shop,
        quantity: item.quantity,
        amount: amount,
        stock: item.product.stock,
        stockStatus: stockStatus
      };
    });

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: {
        items: cartItems,
        total: total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message
    });
  }
};



const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required"
      });
    }

    const newQuantity = Number(quantity);

    if (isNaN(newQuantity) || newQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1"
      });
    }

    const cart = await Cart.findOne({
      user: req.user.userId
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const cartItem = cart.items.find(
      (item) =>
        item.product.toString() ===
        productId.toString()
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available"
      });
    }

    cartItem.quantity = newQuantity;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      data: cart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart quantity",
      error: error.message
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user.userId
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const itemExists = cart.items.some(
      (item) =>
        item.product.toString() ===
        productId.toString()
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart"
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !==
        productId.toString()
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      data: cart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
      error: error.message
    });
  }
};


const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.userId
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message
    });
  }
};

const validateCartStock = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        if (cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const stockIssues = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product);

            if (!product) {
                stockIssues.push({
                    productId: item.product,
                    message: "Product no longer exists"
                });

                continue;
            }

            if (product.stock === 0) {
                stockIssues.push({
                    productId: product._id,
                    productName: product.name,
                    requestedQuantity: item.quantity,
                    availableStock: 0,
                    message: "Product is out of stock"
                });
            } else if (item.quantity > product.stock) {
                stockIssues.push({
                    productId: product._id,
                    productName: product.name,
                    requestedQuantity: item.quantity,
                    availableStock: product.stock,
                    message: "Insufficient stock"
                });
            }
        }

        if (stockIssues.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some products have insufficient stock",
                stockIssues: stockIssues
            });
        }

        res.status(200).json({
            success: true,
            message: "Cart stock validated successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to validate cart stock",
            error: error.message
        });
    }
};

module.exports = {
  addToCart,
  getMyCart,
  updateCartQuantity,
  removeFromCart,
  validateCartStock,
  clearCart
};