const fs = require('fs');
const path = require('path');

exports.listUploads = (req, res) => {
    const uploadsDir = path.join(__dirname, '../uploads');

    fs.readdir(uploadsDir, (err, files) => {
        if (err) return res.status(500).json({ error: err.message });

        const fileUrls = files.map(file => ({
            name: file,
            url: `${req.protocol}://${req.get('host')}/uploads/${file}`
        }));

        res.status(200).json({ files: fileUrls });
    });
};
