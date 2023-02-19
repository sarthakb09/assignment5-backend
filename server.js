const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
app.use(cors());

const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'key_here',
    secretAccessKey: 'secret_key_here',
  },
});

const storage = multer.memoryStorage();

const upload = multer({ storage }).single('file');

app.post('/upload', (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    const params = {
      Bucket: 'bucket_name_here',
      Key: `${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
    };

    const command = new PutObjectCommand(params);

    s3Client.send(command)
      .then((data) => {
        return res.status(200).json({
          message: 'File uploaded successfully',
          url: `https://${params.Bucket}.s3.${s3Client.config.region}.amazonaws.com/${params.Key}`,
        });
      })
      .catch((err) => {
        return res.status(500).json(err);
      });
  });
});

app.listen(8080, function () {
  console.log('Server started on port 8080');
});