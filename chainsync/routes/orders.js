const express = require('express');
const Joi = require('joi');
const router = express.Router();

// Validation schemas
const createOrderSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().default(1),
  paymentChain: Joi.string().valid('ethereum', 'polygon', 'base', 'solana', 'push').required(),
  buyerAddress: Joi.string().required(),
  currency: Joi.string().valid('ETH', 'MATIC', 'SOL', 'PC').required(),
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().allow(''),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
    phone: Joi.string()
  }).when('shippingRequired', { is: true, then: Joi.required() })
});

const updateOrderSchema = Joi.object({
  status: Joi.string().valid('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'disputed'),
  trackingNumber: Joi.string(),
  notes: Joi.string()
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  // In a real app, this would verify JWT token
  req.user = { id: 1, username: 'demo_user' };
  next();
};

// GET /api/orders - Get user's orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const {
      status,
      type = 'all', // 'purchases', 'sales', 'all'
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let orders;
    if (type === 'purchases') {
      orders = await req.database.getUserOrders(req.user.id, parseInt(limit), offset);
      orders = orders.filter(order => order.buyer_id === req.user.id);
    } else if (type === 'sales') {
      orders = await req.database.getUserOrders(req.user.id, parseInt(limit), offset);
      orders = orders.filter(order => order.seller_id === req.user.id);
    } else {
      orders = await req.database.getUserOrders(req.user.id, parseInt(limit), offset);
    }

    // Filter by status if provided
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    // Parse JSON fields
    orders = orders.map(order => ({
      ...order,
      shipping_address: JSON.parse(order.shipping_address || '{}'),
      product_images: JSON.parse(order.product_images || '[]')
    }));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: orders.length
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    const order = await req.database.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order'
      });
    }

    // Get cross-chain transaction details if available
    const db = await req.database.getDb();
    const crossChainTx = await db.get(`
      SELECT * FROM cross_chain_transactions WHERE order_id = ?
    `, [orderId]);

    res.json({
      success: true,
      data: {
        ...order,
        crossChainTransaction: crossChainTx
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// POST /api/orders - Create new order
router.post('/', requireAuth, async (req, res) => {
  try {
    // Validate order data
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { productId, quantity, paymentChain, buyerAddress, currency, shippingAddress } = value;

    // Get product details
    const product = await req.database.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if product is available
    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Product is not available'
      });
    }

    // Check quantity availability
    if (!product.unlimited_quantity && product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient quantity available'
      });
    }

    // Prevent self-purchase
    if (product.seller_id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot purchase your own product'
      });
    }

    // Calculate pricing based on selected currency
    let unitPrice;
    switch (currency) {
      case 'ETH':
        unitPrice = product.price_eth || await convertFromUSD(product.price_usd, 'ETH');
        break;
      case 'MATIC':
        unitPrice = product.price_matic || await convertFromUSD(product.price_usd, 'MATIC');
        break;
      case 'SOL':
        unitPrice = product.price_sol || await convertFromUSD(product.price_usd, 'SOL');
        break;
      case 'PC':
        unitPrice = product.price_pc || await convertFromUSD(product.price_usd, 'PC');
        break;
      default:
        unitPrice = product.price_usd;
    }

    const totalAmount = unitPrice * quantity;

    // Generate order number
    const orderNumber = req.database.generateOrderNumber();

    // Get seller's address for the payment chain
    const seller = await req.database.getUserById(product.seller_id);
    const sellerAddress = getSellerAddressForChain(seller, paymentChain);

    if (!sellerAddress) {
      return res.status(400).json({
        success: false,
        error: `Seller doesn't have a ${paymentChain} address configured`
      });
    }

    // Create order
    const orderData = {
      orderNumber,
      buyerId: req.user.id,
      sellerId: product.seller_id,
      productId,
      quantity,
      unitPrice,
      totalAmount,
      currency,
      paymentChain,
      buyerAddress,
      sellerAddress,
      shippingAddress: product.shipping_required ? shippingAddress : null
    };

    const orderId = await req.database.createOrder(orderData);

    // Log analytics event
    await req.database.logEvent({
      userId: req.user.id,
      eventType: 'order_created',
      eventData: {
        orderId,
        productId,
        amount: totalAmount,
        currency,
        paymentChain
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Emit real-time notifications
    req.io.to(`user-${product.seller_id}`).emit('new-order', {
      orderId,
      orderNumber,
      productTitle: product.title,
      buyerName: req.user.username,
      amount: totalAmount,
      currency
    });

    res.status(201).json({
      success: true,
      data: {
        orderId,
        orderNumber,
        totalAmount,
        currency,
        paymentInstructions: {
          chain: paymentChain,
          toAddress: sellerAddress,
          amount: totalAmount,
          currency
        },
        message: 'Order created successfully. Please complete payment to confirm.'
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// POST /api/orders/:id/pay - Process payment for order
router.post('/:id/pay', requireAuth, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { transactionHash, privateKey } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    if (!transactionHash && !privateKey) {
      return res.status(400).json({
        success: false,
        error: 'Transaction hash or private key required'
      });
    }

    // Get order details
    const order = await req.database.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user is the buyer
    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to pay for this order'
      });
    }

    // Check if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Order is not in pending status'
      });
    }

    let paymentResult;

    if (transactionHash) {
      // Verify existing transaction
      const txStatus = await req.universalChain.getTransactionStatus(transactionHash, order.payment_chain);
      
      if (!txStatus.confirmed || txStatus.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          error: 'Transaction not confirmed or failed'
        });
      }

      paymentResult = {
        success: true,
        txHash: transactionHash,
        chain: order.payment_chain
      };

    } else if (privateKey) {
      // Process new payment
      paymentResult = await req.universalChain.processPayment({
        fromChain: order.payment_chain,
        toChain: order.payment_chain,
        fromAddress: order.buyer_address,
        toAddress: order.seller_address,
        amount: order.total_amount,
        currency: order.currency,
        privateKey
      });
    }

    if (paymentResult.success) {
      // Update order status
      await req.database.updateOrderStatus(orderId, 'paid', {
        transaction_hash: paymentResult.txHash || transactionHash,
        payment_status: 'confirmed',
        paid_at: new Date().toISOString()
      });

      // Update product quantity if not unlimited
      const product = await req.database.getProductById(order.product_id);
      if (!product.unlimited_quantity) {
        const db = await req.database.getDb();
        await db.run(`
          UPDATE products SET quantity = quantity - ? WHERE id = ?
        `, [order.quantity, order.product_id]);
      }

      // Create cross-chain transaction record
      const db = await req.database.getDb();
      await db.run(`
        INSERT INTO cross_chain_transactions (
          order_id, source_chain, source_address, source_tx_hash,
          destination_chain, destination_address, destination_tx_hash,
          amount, currency, status, confirmed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', CURRENT_TIMESTAMP)
      `, [
        orderId, order.payment_chain, order.buyer_address, paymentResult.txHash || transactionHash,
        order.payment_chain, order.seller_address, paymentResult.txHash || transactionHash,
        order.total_amount, order.currency
      ]);

      // Notify seller
      req.io.to(`user-${order.seller_id}`).emit('order-paid', {
        orderId,
        orderNumber: order.order_number,
        amount: order.total_amount,
        currency: order.currency,
        txHash: paymentResult.txHash || transactionHash
      });

      // Log analytics
      await req.database.logEvent({
        userId: req.user.id,
        eventType: 'payment_completed',
        eventData: {
          orderId,
          amount: order.total_amount,
          currency: order.currency,
          chain: order.payment_chain
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: {
          transactionHash: paymentResult.txHash || transactionHash,
          explorerUrl: getExplorerUrl(order.payment_chain, paymentResult.txHash || transactionHash)
        },
        message: 'Payment processed successfully'
      });

    } else {
      res.status(400).json({
        success: false,
        error: 'Payment processing failed'
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
});

// PUT /api/orders/:id - Update order (seller only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    // Validate update data
    const { error, value } = updateOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Get order details
    const order = await req.database.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user is the seller
    if (order.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this order'
      });
    }

    // Update order
    const updateData = {};
    if (value.status) updateData.status = value.status;
    if (value.trackingNumber) updateData.tracking_number = value.trackingNumber;
    if (value.notes) updateData.notes = value.notes;

    // Set shipping status based on order status
    if (value.status === 'shipped') {
      updateData.shipping_status = 'shipped';
      updateData.shipped_at = new Date().toISOString();
    } else if (value.status === 'delivered') {
      updateData.shipping_status = 'delivered';
      updateData.delivered_at = new Date().toISOString();
    }

    await req.database.updateOrderStatus(orderId, value.status, updateData);

    // Notify buyer
    req.io.to(`user-${order.buyer_id}`).emit('order-updated', {
      orderId,
      orderNumber: order.order_number,
      status: value.status,
      trackingNumber: value.trackingNumber
    });

    res.json({
      success: true,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order'
    });
  }
});

// POST /api/orders/:id/review - Create review for completed order
router.post('/:id/review', requireAuth, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { rating, title, content, images = [] } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    // Validate review data
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Review content must be at least 10 characters'
      });
    }

    // Get order details
    const order = await req.database.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user is the buyer
    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only buyers can review orders'
      });
    }

    // Check if order is completed
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Can only review completed orders'
      });
    }

    // Check if review already exists
    const db = await req.database.getDb();
    const existingReview = await db.get(`
      SELECT id FROM reviews WHERE order_id = ?
    `, [orderId]);

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'Review already exists for this order'
      });
    }

    // Create review
    const reviewData = {
      orderId,
      reviewerId: req.user.id,
      reviewedUserId: order.seller_id,
      productId: order.product_id,
      rating: parseInt(rating),
      title: title || '',
      content: content.trim(),
      images
    };

    const reviewId = await req.database.createReview(reviewData);

    // Notify seller
    req.io.to(`user-${order.seller_id}`).emit('new-review', {
      reviewId,
      orderId,
      rating,
      reviewerName: req.user.username
    });

    res.status(201).json({
      success: true,
      data: { reviewId },
      message: 'Review created successfully'
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create review'
    });
  }
});

// Helper functions
function getSellerAddressForChain(seller, chain) {
  const addressMap = {
    ethereum: seller.ethereum_address,
    polygon: seller.polygon_address,
    base: seller.base_address,
    solana: seller.solana_address,
    push: seller.push_chain_address
  };
  return addressMap[chain];
}

function getExplorerUrl(chain, txHash) {
  const explorers = {
    ethereum: `https://etherscan.io/tx/${txHash}`,
    polygon: `https://polygonscan.com/tx/${txHash}`,
    base: `https://basescan.org/tx/${txHash}`,
    push: `https://scan.push.org/tx/${txHash}`
  };
  return explorers[chain] || `https://scan.push.org/tx/${txHash}`;
}

async function convertFromUSD(usdAmount, currency) {
  // In a real app, this would fetch live exchange rates
  const rates = {
    ETH: 0.0005, // 1 USD = 0.0005 ETH (example)
    MATIC: 1.2,   // 1 USD = 1.2 MATIC
    SOL: 0.025,   // 1 USD = 0.025 SOL
    PC: 10        // 1 USD = 10 PC
  };
  return usdAmount * (rates[currency] || 1);
}

module.exports = router;