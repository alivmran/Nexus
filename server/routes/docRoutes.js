const express = require('express');
const { uploadDocument, getDocuments, signDocument } = require('../controllers/docController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, uploadDocument);

router.get('/', protect, getDocuments);

router.put('/:id/sign', protect, signDocument);

module.exports = router;