const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, getSpecializations } = require('../controllers/doctorController');

router.get('/', getAllDoctors);
router.get('/specializations', getSpecializations);
router.get('/:id', getDoctorById);

module.exports = router;
