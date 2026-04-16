const crypto = require('crypto');
const db = require('../config/db');

// Check if Razorpay keys are configured
const hasRazorpayKeys = () => {
  return process.env.RAZORPAY_KEY_ID && 
         process.env.RAZORPAY_KEY_SECRET && 
         process.env.RAZORPAY_KEY_ID !== 'rzp_test_your_key_id';
};

let razorpay = null;
if (hasRazorpayKeys()) {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

const createOrder = async (req, res) => {
  try {
    const { doctorId, amount } = req.body;
    const doctor = db.findDoctorById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const orderAmount = amount || doctor.fee;

    if (razorpay) {
      // Real Razorpay order
      const options = {
        amount: orderAmount * 100, // Convert to paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          doctorId: doctor.id,
          doctorName: doctor.name,
          userId: req.user.id
        }
      };

      const order = await razorpay.orders.create(options);

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        doctorName: doctor.name,
        mode: 'live'
      });
    } else {
      // Demo mode - simulate order creation
      const demoOrderId = 'order_demo_' + Date.now();
      
      res.json({
        orderId: demoOrderId,
        amount: orderAmount * 100,
        currency: 'INR',
        keyId: 'rzp_demo_key',
        doctorName: doctor.name,
        mode: 'demo'
      });
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create payment order.' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, doctorId, demo } = req.body;

    let isValid = false;

    if (demo || !hasRazorpayKeys()) {
      // Demo mode - always valid
      isValid = true;
    } else {
      // Verify Razorpay signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      isValid = expectedSignature === razorpay_signature;
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    // Create payment record
    const payment = {
      id: 'pay-' + Date.now(),
      userId: req.user.id,
      doctorId,
      orderId: razorpay_order_id || 'demo_order',
      paymentId: razorpay_payment_id || 'demo_payment_' + Date.now(),
      amount: req.body.amount || 0,
      status: 'success',
      createdAt: new Date().toISOString()
    };

    db.addPayment(payment);

    // Create chat session
    const session = {
      id: 'session-' + Date.now(),
      userId: req.user.id,
      doctorId,
      paymentId: payment.id,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min session
    };

    db.addChatSession(session);

    const doctor = db.findDoctorById(doctorId);

    res.json({
      message: 'Payment verified successfully!',
      sessionId: session.id,
      doctor: { id: doctor.id, name: doctor.name, specialization: doctor.specialization },
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed.' });
  }
};

const getPaymentHistory = (req, res) => {
  const payments = db.payments.filter(p => p.userId === req.user.id);
  res.json({ payments: payments.reverse() });
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
