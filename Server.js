const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const allowedMimeTypes = [
  'image/png', 'image/jpeg', 'text/plain',
  'application/pdf', 'application/zip'
];

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ storage, fileFilter });

// POST /upload → Uploads the file
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded or file type not allowed.');
  }
  res.send('File uploaded successfully!');
});

// GET /files → List uploaded files
app.get('/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) return res.status(500).send('Unable to list files.');
    res.json(files);
  });
});

// DELETE /delete/:filename → Deletes a file
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  fs.unlink(filepath, (err) => {
    if (err) return res.status(500).send('Could not delete file.');
    res.send('File deleted.');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 WhaleDrop backend running at http://localhost:${PORT}`);
});
