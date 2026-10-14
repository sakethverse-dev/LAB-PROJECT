import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

// @desc   Add a product to user's cart (or increment quantity if already present)
export const addToCart = async (req, res) => {
  try {
    const productId = req.params.productId || req.body?.productId;
    const addQuantity = Number(req.body?.quantity) > 0 ? Number(req.body.quantity) : 1;

    // Validate productId format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Verify product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product is out of stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is currently out of stock',
      });
    }

    // Load authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Check if product already exists in user's cart
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Validate that incrementing does not exceed stock
      if (existingItem.quantity + addQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more units. Only ${product.stock} available in stock.`,
        });
      }
      existingItem.quantity += addQuantity;
    } else {
      if (addQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock} available)`,
        });
      }
      user.cart.push({
        product: productId,
        quantity: addQuantity,
      });
    }

    await user.save();
    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: validCart,
    });
  } catch (error) {
    console.error('Add to Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding product to cart',
      error: error.message,
    });
  }
};

// @desc   Get authenticated user's cart populated with product details
// @route  GET /cart
export const getCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Filter out items where the referenced product might have been deleted
    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      count: validCart.length,
      cart: validCart,
    });
  } catch (error) {
    console.error('Get Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message,
    });
  }
};

// @desc   Update quantity of a product in the cart
// @route  PATCH /cart/:productId
export const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Validate quantity is an integer >= 1
    const numQty = Number(quantity);
    if (!Number.isInteger(numQty) || numQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a whole number of at least 1',
      });
    }

    // Verify product exists and check stock limits
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (numQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock} units available)`,
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    cartItem.quantity = numQty;
    await user.save();
    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: validCart,
    });
  } catch (error) {
    console.error('Update Quantity Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart quantity',
      error: error.message,
    });
  }
};

// @desc   Remove a product from the user's cart
// @route  DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    const exists = user.cart.some(
      (item) => item.product.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();
    await user.populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    const validCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: validCart,
    });
  } catch (error) {
    console.error('Remove from Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing product from cart',
      error: error.message,
    });
  }
};
