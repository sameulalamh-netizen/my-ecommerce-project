const Category = require("../model/Category");
const Product = require("../model/product");
const cloudinary = require("../config/cloudinary");


const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const existingCategory = await Category.findOne({
      name: name
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'categories' },
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

    const category = await Category.create({
      name,
      description,
      image: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message
    });
  }
};


const getCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
            error: error.message
        });
    }
};


const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;
        
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if (name !== undefined) {
            category.name = name;
        }

        if (description !== undefined) {
            category.description = description;
        }
    

        // Upload new image to Cloudinary if provided
        if (req.file) {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'categories' }, 
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

          // Delete the old image from Cloudinary if it exists
          if (category.image && category.image.publicId) {
            await cloudinary.uploader.destroy(category.image.publicId);
          }


          category.image = {
            url: result.secure_url,
            publicId: result.public_id
          };
        }

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update category",
            error: error.message
        });
    }
};


const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const productExists = await Product.findOne({
            category: categoryId
        });

        if (productExists) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category because products exist in this category"
            });
        }

        if (category.image && category.image.publicId) {    
          await cloudinary.uploader.destroy(category.image.publicId);
        }


        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete category",
            error: error.message
        });
    }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};