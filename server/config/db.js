const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log(`  ✅ MongoDB connected: ${conn.connection.host}`);
    
    // Seed doctors if collection is empty
    const count = await Doctor.countDocuments();
    if (count === 0) {
      await seedDoctors();
    }
  } catch (error) {
    console.error('  ❌ MongoDB connection error:', error.message);
    throw error;
  }
};

const seedDoctors = async () => {
  const doctors = [
    {
      name: 'Dr. Priya Sharma',
      specialization: 'General Physician',
      experience: 12,
      rating: 4.8,
      reviews: 342,
      fee: 499,
      avatar: 'PS',
      available: true,
      bio: 'Experienced general physician with expertise in preventive medicine, chronic disease management, and holistic patient care. MBBS from AIIMS Delhi.',
      languages: ['Hindi', 'English'],
      nextAvailable: '10 min',
      consultations: 2850
    },
    {
      name: 'Dr. Rajesh Mehta',
      specialization: 'Cardiologist',
      experience: 18,
      rating: 4.9,
      reviews: 528,
      fee: 899,
      avatar: 'RM',
      available: true,
      bio: 'Senior cardiologist specializing in interventional cardiology and heart failure management. MD Cardiology from PGI Chandigarh.',
      languages: ['Hindi', 'English', 'Punjabi'],
      nextAvailable: '30 min',
      consultations: 4200
    },
    {
      name: 'Dr. Ananya Desai',
      specialization: 'Dermatologist',
      experience: 8,
      rating: 4.7,
      reviews: 276,
      fee: 599,
      avatar: 'AD',
      available: true,
      bio: 'Dermatologist with special interest in cosmetic dermatology, acne treatment, and skin allergies. MD Dermatology from KEM Mumbai.',
      languages: ['Hindi', 'English', 'Marathi'],
      nextAvailable: '15 min',
      consultations: 1890
    },
    {
      name: 'Dr. Vikram Singh',
      specialization: 'Orthopedic Surgeon',
      experience: 15,
      rating: 4.6,
      reviews: 189,
      fee: 749,
      avatar: 'VS',
      available: false,
      bio: 'Orthopedic surgeon specializing in joint replacement, sports injuries, and spine surgery. MS Orthopedics from Safdarjung Hospital.',
      languages: ['Hindi', 'English'],
      nextAvailable: '2 hours',
      consultations: 3100
    },
    {
      name: 'Dr. Meera Krishnan',
      specialization: 'Pediatrician',
      experience: 10,
      rating: 4.9,
      reviews: 412,
      fee: 549,
      avatar: 'MK',
      available: true,
      bio: 'Child specialist with expertise in neonatal care, childhood vaccinations, and developmental pediatrics. MD Pediatrics from CMC Vellore.',
      languages: ['Hindi', 'English', 'Tamil'],
      nextAvailable: '5 min',
      consultations: 3600
    },
    {
      name: 'Dr. Arjun Patel',
      specialization: 'Psychiatrist',
      experience: 14,
      rating: 4.8,
      reviews: 305,
      fee: 799,
      avatar: 'AP',
      available: true,
      bio: 'Psychiatrist specializing in anxiety disorders, depression, and cognitive behavioral therapy. MD Psychiatry from NIMHANS Bangalore.',
      languages: ['Hindi', 'English', 'Gujarati'],
      nextAvailable: '20 min',
      consultations: 2400
    }
  ];

  await Doctor.insertMany(doctors);
  console.log('  📋 Seeded 6 doctors into MongoDB');
};

module.exports = connectDB;
