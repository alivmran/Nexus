const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');

// 1. Configure Storage (Where to save files)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// 2. Filter (Only accept PDFs and Images)
const fileFilter = (req, file, cb) => {
    const filetypes = /pdf|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images and PDFs only!'));
    }
};

const upload = multer({ 
    storage, 
    fileFilter 
}).single('document'); 

// 3. Controller Functions
const uploadDocument = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file selected' });
        }

        try {
            const doc = await Document.create({
                title: req.body.title || req.file.originalname,
                filePath: `/uploads/${req.file.filename}`,
                fileType: req.file.mimetype,
                uploadedBy: req.user.id
            });

            res.status(201).json(doc);
        } catch (error) {
            res.status(500).json({ message: 'Database Error' });
        }
    });
};

const getDocuments = async (req, res) => {
    try {
        const docs = await Document.find()
            .populate('uploadedBy', 'name email role')
            .sort({ createdAt: -1 });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const signDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Check if already signed
        if (doc.signedBy.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have already signed this' });
        }

        doc.signedBy.push(req.user.id);
        doc.status = 'signed';
        await doc.save();

        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { uploadDocument, getDocuments, signDocument };