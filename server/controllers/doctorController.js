const Doctor = require('../models/Doctor');

const getAllDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    const filter = specialization ? { specialization } : {};
    const doctors = await Doctor.find(filter);
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors.' });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }
    res.json({ doctor });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctor.' });
  }
};

const getSpecializations = async (req, res) => {
  try {
    const specializations = await Doctor.distinct('specialization');
    res.json({ specializations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch specializations.' });
  }
};

module.exports = { getAllDoctors, getDoctorById, getSpecializations };
