const Shop = require('../model/Shop');

const createShop = async (req, res) => {
  try{
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Shop name is required'
      });
    }
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Shop description is required'
      });
    }

    const shop = await Shop.create({
      name: name,
      description: description,
      owner: req.user.userId
    });
    return res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create shop',
      error: error.message
    });
  }
};

const getShops = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: shop
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shop',
      error: error.message
    });
  }
};

const updateShop = async (req, res) => {
  try {
    const { name, description } = req.body;
    const shop = await Shop.findOne({ owner: req.user.userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    if (name) {
      shop.name = name;
    }
    if (description) {
      shop.description = description;
    }
    await shop.save();
    return res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      data: shop
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update shop',
      error: error.message
    });
  }
};

const deleteShop = async (req, res) => {
  try {
    const {shopId} = req.params;
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    await Shop.findByIdAndDelete(shopId);
    return res.status(200).json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete shop',
      error: error.message
    });
  }
};

module.exports = { createShop, getShops, updateShop, deleteShop };