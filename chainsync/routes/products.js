const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP images and MP4 videos allowed.'));
    }
  }
});

// Validation schemas
const productSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(5000).required(),
  shortDescription: Joi.string().max(500),
  pricePc: Joi.number().positive(),
  priceEth: Joi.number().positive(),
  priceMatic: Joi.number().positive(),
  priceSol: Joi.number().positive(),
  priceUsd: Joi.number().positive().required(),
  category: Joi.string().required(),
  subcategory: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  condition: Joi.string().valid('new', 'used', 'refurbished').default('new'),
  brand: Joi.string(),
  model: Joi.string(),
  quantity: Joi.number().integer().min(0).default(1),
  unlimitedQuantity: Joi.boolean().default(false),
  digitalProduct: Joi.boolean().default(false),
  shippingRequired: Joi.boolean().default(true),
  shippingCostUsd: Joi.number().min(0).default(0),
  shippingRegions: Joi.array().items(Joi.string()),
  processingTimeDays: Joi.number().integer().min(1).max(30).default(3)
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  // In a real app, this would verify JWT token
  // For demo purposes, we'll simulate authentication
  req.user = { id: 1, username: 'demo_user' };
  next();
};

// GET /api/products - Get all products with filtering
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
      featured,
      sellerId
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const filters = {
      category,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder,
      featured: featured === 'true',
      sellerId: sellerId ? parseInt(sellerId) : undefined
    };

    const products = await req.database.getProducts(filters, parseInt(limit), offset);

    // Get total count for pagination
    const totalQuery = `
      SELECT COUNT(*) as total FROM products p 
      WHERE p.status = 'active'
      ${category ? 'AND p.category = ?' : ''}
      ${search ? 'AND (p.title LIKE ? OR p.description LIKE ?)' : ''}
      ${minPrice ? 'AND p.price_usd >= ?' : ''}
      ${maxPrice ? 'AND p.price_usd <= ?' : ''}
      ${featured ? 'AND p.featured = 1' : ''}
      ${sellerId ? 'AND p.seller_id = ?' : ''}
    `;

    const countParams = [];
    if (category) countParams.push(category);
    if (search) countParams.push(`%${search}%`, `%${search}%`);
    if (minPrice) countParams.push(minPrice);
    if (maxPrice) countParams.push(maxPrice);
    if (sellerId) countParams.push(sellerId);

    const db = await req.database.getDb();
    const totalResult = await db.get(totalQuery, countParams);
    const total = totalResult.total;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// GET /api/products/categories - Get product categories
router.get('/categories', async (req, res) => {
  try {
    const db = await req.database.getDb();
    const categories = await db.all(`
      SELECT category, COUNT(*) as count 
      FROM products 
      WHERE status = 'active' 
      GROUP BY category 
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await req.database.getProducts({ featured: true }, limit, 0);

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured products'
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    const product = await req.database.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Update view count
    await req.database.updateProductViews(productId);

    // Get reviews
    const reviews = await req.database.getProductReviews(productId, 5, 0);

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    res.json({
      success: true,
      data: {
        ...product,
        reviews,
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: reviews.length
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// POST /api/products - Create new product
router.post('/', requireAuth, upload.array('files', 10), async (req, res) => {
  try {
    // Validate product data
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Process uploaded files
    const images = [];
    const videos = [];

    if (req.files && req.files.length > 0) {
      const uploadDir = path.join(__dirname, '../uploads/products');
      await fs.mkdir(uploadDir, { recursive: true });

      for (const file of req.files) {
        const fileId = uuidv4();
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');

        if (isImage) {
          // Process and save image
          const filename = `${fileId}.webp`;
          const filepath = path.join(uploadDir, filename);
          
          await sharp(file.buffer)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(filepath);

          images.push(`/uploads/products/${filename}`);

          // Create thumbnail
          const thumbFilename = `${fileId}_thumb.webp`;
          const thumbFilepath = path.join(uploadDir, thumbFilename);
          
          await sharp(file.buffer)
            .resize(200, 200, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(thumbFilepath);

        } else if (isVideo) {
          // Save video (in production, you'd want to process/compress videos)
          const filename = `${fileId}.mp4`;
          const filepath = path.join(uploadDir, filename);
          
          await fs.writeFile(filepath, file.buffer);
          videos.push(`/uploads/products/${filename}`);
        }
      }
    }

    // Generate slug
    const slug = value.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    // Create product
    const productData = {
      ...value,
      sellerId: req.user.id,
      images,
      videos,
      slug
    };

    const productId = await req.database.createProduct(productData);

    // Log analytics event
    await req.database.logEvent({
      userId: req.user.id,
      eventType: 'product_created',
      eventData: {
        productId,
        category: value.category,
        price: value.priceUsd
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Emit real-time notification
    req.io.emit('new-product', {
      productId,
      title: value.title,
      category: value.category,
      seller: req.user.username
    });

    res.status(201).json({
      success: true,
      data: {
        productId,
        message: 'Product created successfully'
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', requireAuth, upload.array('files', 10), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    // Check if product exists and user owns it
    const existingProduct = await req.database.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (existingProduct.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    // Validate update data
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Process new uploaded files (similar to create)
    let newImages = JSON.parse(existingProduct.images || '[]');
    let newVideos = JSON.parse(existingProduct.videos || '[]');

    if (req.files && req.files.length > 0) {
      // Process new files (implementation similar to POST route)
      // For brevity, omitting the full file processing code
    }

    // Update product in database
    const db = await req.database.getDb();
    await db.run(`
      UPDATE products SET 
        title = ?, description = ?, short_description = ?,
        price_pc = ?, price_eth = ?, price_matic = ?, price_sol = ?, price_usd = ?,
        category = ?, subcategory = ?, tags = ?, condition = ?, brand = ?, model = ?,
        quantity = ?, unlimited_quantity = ?, digital_product = ?,
        images = ?, videos = ?, shipping_required = ?, shipping_cost_usd = ?,
        shipping_regions = ?, processing_time_days = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      value.title, value.description, value.shortDescription,
      value.pricePc, value.priceEth, value.priceMatic, value.priceSol, value.priceUsd,
      value.category, value.subcategory, JSON.stringify(value.tags), value.condition, value.brand, value.model,
      value.quantity, value.unlimitedQuantity, value.digitalProduct,
      JSON.stringify(newImages), JSON.stringify(newVideos), value.shippingRequired, value.shippingCostUsd,
      JSON.stringify(value.shippingRegions), value.processingTimeDays,
      productId
    ]);

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    // Check if product exists and user owns it
    const product = await req.database.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this product'
      });
    }

    // Soft delete (mark as deleted instead of removing)
    const db = await req.database.getDb();
    await db.run(`
      UPDATE products SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [productId]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// POST /api/products/:id/like - Like/unlike product
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    const liked = await req.database.likeProduct(req.user.id, productId);
    
    if (liked) {
      // Emit real-time notification
      req.io.to(`product-${productId}`).emit('product-liked', {
        productId,
        userId: req.user.id,
        username: req.user.username
      });
    }

    res.json({
      success: true,
      data: { liked },
      message: liked ? 'Product liked' : 'Product already liked'
    });

  } catch (error) {
    console.error('Like product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like product'
    });
  }
});

// DELETE /api/products/:id/like - Unlike product
router.delete('/:id/like', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    const unliked = await req.database.unlikeProduct(req.user.id, productId);

    res.json({
      success: true,
      data: { unliked },
      message: unliked ? 'Product unliked' : 'Product was not liked'
    });

  } catch (error) {
    console.error('Unlike product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike product'
    });
  }
});

module.exports = router;