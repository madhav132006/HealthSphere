const crypto = require('crypto');
const Doctor = require('../models/Doctor');
const Payment = require('../models/Payment');
const ChatSession = require('../models/ChatSession');

const hasRazorpayKeys = () => {
  return process.env.RAZORPAY_KEY_ID && 
         process.env.RAZORPAY_KEY_SECRET && 
         process.env.RAZORPAY_KEY_ID !== 'rzp_test_your_key_id';
};

let razorpay = null;
const getRazorpay = () => {
  if (razorpay) return razorpay;
  if (hasRazorpayKeys()) {
    try {
      const Razorpay = require('razorpay');
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    } catch (err) {
      console.error('Failed to load Razorpay SDK:', err.message);
    }
  }
  return razorpay;
};

const createOrder = async (req, res) => {
  try {
    const { doctorId, amount } = req.body;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const orderAmount = amount || doctor.fee;
    const rzp = getRazorpay();

    if (rzp) {
      const options = {
        amount: orderAmount * 100,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          doctorId: doctor._id.toString(),
          doctorName: doctor.name,
          userId: req.user.id
        }
      };

      const order = await rzp.orders.create(options);

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        doctorName: doctor.name,
        mode: 'live'
      });
    } else {
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
    if (error.statusCode) {
      console.error('Razorpay Error Details:', error.error);
    }
    res.status(500).json({ message: 'Failed to create payment order.', details: error.message || error });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, doctorId, demo } = req.body;

    let isValid = false;

    if (demo || !hasRazorpayKeys()) {
      isValid = true;
    } else {
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

    // Create payment record in MongoDB
    const payment = await Payment.create({
      userId: req.user.id,
      doctorId,
      orderId: razorpay_order_id || 'demo_order',
      paymentId: razorpay_payment_id || 'demo_payment_' + Date.now(),
      amount: req.body.amount || 0,
      status: 'success'
    });

    // Create chat session in MongoDB
    const session = await ChatSession.create({
      userId: req.user.id,
      doctorId,
      paymentId: payment._id,
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    const doctor = await Doctor.findById(doctorId);

    res.json({
      message: 'Payment verified successfully!',
      sessionId: session._id,
      doctor: { id: doctor._id, name: doctor.name, specialization: doctor.specialization },
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed.' });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payment history.' });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
