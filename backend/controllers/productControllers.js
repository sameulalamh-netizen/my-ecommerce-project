const Product = require('../model/product');
const Shop = require('../model/Shop');
const cloudinary = require('../config/cloudinary');
const Category = require('../model/Category');



const getProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const products = await Product.find({ shop: shop._id })
      .populate('shop', 'name description logo')
      .populate('category', 'name description')

    res.status(200).json({
      success: true,
      products: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || stock == undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }


    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const shop = await Shop.findOne({ owner: req.user.userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const productPrice = Number(price);
    const productStock = Number(stock);

    if (isNaN(productPrice) || productPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0"
      });
    }

    if (isNaN(productStock) || productStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative"
      });
    }

    const product = await Product.create({
      name: name,
      description: description,
      price: productPrice,
      stock: productStock,
      category: category,
      image: {
        url: result.secure_url,
        publicId: result.public_id
      }
      ,
      shop: shop._id,
    });
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
}



const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const {
      name,
      description,
      price,
      stock,
      category
    } = req.body;

    // 1. Convert price and stock into numbers
    const productPrice =
      price !== undefined ? Number(price) : undefined;

    const productStock =
      stock !== undefined ? Number(stock) : undefined;

    // 2. Validate price
    if (productPrice !== undefined) {
      if (
        !Number.isFinite(productPrice) ||
        productPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than 0"
        });
      }
    }

    // 3. Validate stock
    if (productStock !== undefined) {
      if (
        !Number.isFinite(productStock) ||
        productStock < 0 ||
        !Number.isInteger(productStock)
      ) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative integer"
        });
      }
    }

    // 4. Find product
    // Do not populate shop here; we need its ObjectId
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 5. Find the logged-in user's shop
    const shop = await Shop.findOne({
      owner: req.user.userId
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found for this user"
      });
    }

    // 6. Check product ownership
    if (product.shop.toString() !== shop._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this product"
      });
    }

    // 7. Update name
    if (name !== undefined) {
      product.name = name;
    }

    // 8. Update description
    if (description !== undefined) {
      product.description = description;
    }

    // 9. Update price
    if (productPrice !== undefined) {
      product.price = productPrice;
    }

    // 10. Update stock
    if (productStock !== undefined) {
      product.stock = productStock;
    }

    // 11. Update category
    if (category !== undefined) {
      const existingCategory = await Category.findById(category);

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      product.category = existingCategory._id;
    }

    // 12. Upload new image if provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      // 13. Save the new image information
      const oldImagePublicId = product.image?.publicId;

      product.image = {
        url: result.secure_url,
        publicId: result.public_id
      };

      // 14. Delete the old image after saving the new image info
      // Cloudinary deletion failure should not hide the update result
      if (oldImagePublicId) {
        try {
          await cloudinary.uploader.destroy(oldImagePublicId);
        } catch (imageError) {
          console.error(
            "Failed to delete old product image:",
            imageError.message
          );
        }
      }
    }

    // 15. Save updated product
    await product.save();

    // 16. Return updated product with populated fields
    const updatedProduct = await Product.findById(product._id)
      .populate("shop", "name description logo")
      .populate("category", "name description");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const shop = await Shop.findOne({ owner: req.user.userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (product.shop.toString() !== shop._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product'
      });
    }
    // Delete the image from Cloudinary
    if (product.image && product.image.publicId) {
      await cloudinary.uploader.destroy(product.image.publicId);
    }


    await product.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
}

const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      sort,
      category,
      page = 1,
      limit = 10
    } = req.query;



    let filter = {};
    //search filter
    if (search) {
      filter = {
        $or: [{
          name: { $regex: search, $options: 'i' } // Case-insensitive search
        }, {
          description: { $regex: search, $options: 'i' } // Case-insensitive search
        }]
      };
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }
    // Category filter
    if (category) {
      filter.category = category;
    }


    // Sorting filter
    let sortOption = {};
    if (sort === 'price_asc') {
      sortOption.price = 1;
    }
    if (sort === 'price_desc') {
      sortOption.price = -1;
    }

    if (sort === 'newest') {
      sortOption.createdAt = -1;
    }
    if (sort === 'oldest') {
      sortOption.createdAt = 1;
    }

    //pagination

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skipNumber = (pageNumber - 1) * limitNumber;

    // Populate the shop field with only the name
    const products = await Product.find(filter)
      .populate('shop', 'name description logo')
      .populate('category', 'name description')
      .sort(sortOption)
      .skip(skipNumber)
      .limit(limitNumber)
      ;

    //total products
    const totalProducts = await Product.countDocuments(filter);

    //total pages
    const totalPages = Math.ceil(totalProducts / limitNumber);



    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      products: products,

      pagination: {
        totalProducts: totalProducts,
        totalPages: totalPages,
        currentPage: pageNumber,
        pageSize: limitNumber
      }
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

const getProductbyId = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId)
      .populate('shop', 'name description logo')
      .populate('category', 'name description');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let stockStatus = "In Stock";

    if (product.stock === 0) {
      stockStatus = "Out of Stock";
    } else if (product.stock <= 5) {
      stockStatus = "Low Stock";
    }

    res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      stockStatus: stockStatus,
      product: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, getAllProducts, getProductbyId };