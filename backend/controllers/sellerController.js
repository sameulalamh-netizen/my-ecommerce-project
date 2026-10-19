const SellerApplication = require('../model/SellerAplication');
const User = require('../model/User');
const Shop = require('../model/Shop');


// Apply to become a seller
const applyForSeller = async (req, res) => {
  try {
    const { shopName, shopDescription } = req.body;
     if (!shopName) {
      return res.status(400).json({
        success: false,
        message: 'Shop name is required'
      });
    }
    const existingApplication = await SellerApplication.findOne({ user: req.user.userId , status: 'pending' });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to become a seller'
      });
    }
    const Application = await SellerApplication.create({
      user: req.user.userId,
      shopName: shopName,
      shopDescription: shopDescription
    });
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: Application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

const getSellerApplications = async (req, res) => {
  try {
    const applications = await SellerApplication.find().populate('user', 'name email role');
    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching seller applications',
      error: error.message
    });
  }
};

const approveSellerApplication = async (req, res) => {
  try {
    const { applicationId } = req.body;

    if(!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const application = await SellerApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed'
      });
    }
    const user = await User.findById(application.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    user.role = 'shop_admin';
    await user.save();

 const shop = await Shop.create({
      name: application.shopName,
      description: application.shopDescription,
      owner: application.user
    });

    application.status = 'approved';
    await application.save();

    

    res.status(200).json({
      success: true,
      message: 'Seller application approved successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving seller application',
      error: error.message
    });
  }   
}

const rejectSellerApplication = async (req, res) => {
  try {
    const { applicationId } = req.body;
    
    if(!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const application = await SellerApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed'
      });
    }
    application.status = 'rejected';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Seller application rejected successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting seller application',
      error: error.message
    });
  }
}

module.exports = {
  applyForSeller,
  getSellerApplications,
  approveSellerApplication,
  rejectSellerApplication
};