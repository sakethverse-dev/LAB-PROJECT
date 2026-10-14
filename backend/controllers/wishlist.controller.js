import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

// @desc   Add a product to authenticated user's wishlist
// @route  POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Verify that the product actually exists in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Load current authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Prevent duplicate entries
    const alreadyInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyInWishlist) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // Add product reference and save
    user.wishlist.push(productId);
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Add to Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding product to wishlist',
      error: error.message,
    });
  }
};

// @desc   Get current authenticated user's wishlist with populated product details
// @route  GET /wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name description price category image stock createdAt',
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Filter out any null entries (if referenced product was deleted from DB)
    const validWishlist = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
      error: error.message,
    });
  }
};

// @desc   Remove a product from authenticated user's wishlist
// @route  DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    // Check if the product is in the user's wishlist
    const exists = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // Remove product from array
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Remove from Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing product from wishlist',
      error: error.message,
    });
  }
};

// @desc   Toggle wishlist state (Bonus Challenge)
// @route  PATCH /wishlist/:productId/toggle
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found',
      });
    }

    const isSaved = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isSaved) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId
      );
      await user.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
      });
    } else {
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Product added to wishlist',
      });
    }
  } catch (error) {
    console.error('Toggle Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while toggling wishlist state',
      error: error.message,
    });
  }
};
