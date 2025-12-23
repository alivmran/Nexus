const Meeting = require('../models/Meeting');

const scheduleMeeting = async (req, res) => {
    const { attendeeId, startTime, endTime } = req.body;
    const organizerId = req.user.id;

    try {
        const start = new Date(startTime);
        const end = new Date(endTime);

        const conflict = await Meeting.findOne({
            $or: [{ organizer: organizerId }, { attendee: organizerId }, { organizer: attendeeId }, { attendee: attendeeId }],
            $and: [
                { startTime: { $lt: end } },
                { endTime: { $gt: start } },
                { status: { $ne: 'rejected' } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ message: 'Time slot conflict detected' });
        }

        const meeting = await Meeting.create({
            organizer: organizerId,
            attendee: attendeeId,
            startTime: start,
            endTime: end
        });

        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({
            $or: [{ organizer: req.user.id }, { attendee: req.user.id }]
        })
        .populate('organizer', 'name email role')
        .populate('attendee', 'name email role')
        .sort({ startTime: 1 });

        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const meeting = await Meeting.findById(req.params.id);
        if(!meeting) return res.status(404).json({ message: 'Meeting not found' });

        if (meeting.attendee.toString() !== req.user.id && meeting.organizer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        meeting.status = status;
        await meeting.save();
        res.json(meeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { scheduleMeeting, getMyMeetings, updateStatus };