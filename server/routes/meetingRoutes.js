const express = require('express');
const { scheduleMeeting, getMyMeetings, updateStatus } = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, scheduleMeeting);
router.get('/', protect, getMyMeetings);
router.put('/:id/status', protect, updateStatus);

module.exports = router;