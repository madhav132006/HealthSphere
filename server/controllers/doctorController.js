const db = require('../config/db');

const getAllDoctors = (req, res) => {
  const { specialization, available } = req.query;
  
  let doctors = [...db.doctors];

  if (specialization && specialization !== 'all') {
    doctors = doctors.filter(d => 
      d.specialization.toLowerCase().includes(specialization.toLowerCase())
    );
  }

  if (available === 'true') {
    doctors = doctors.filter(d => d.available);
  }

  // Remove sensitive data
  const publicDoctors = doctors.map(({ ...doc }) => doc);

  res.json({ doctors: publicDoctors });
};

const getDoctorById = (req, res) => {
  const doctor = db.findDoctorById(req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found.' });
  }

  res.json({ doctor });
};

const getSpecializations = (req, res) => {
  const specializations = [...new Set(db.doctors.map(d => d.specialization))];
  res.json({ specializations });
};

module.exports = { getAllDoctors, getDoctorById, getSpecializations };
