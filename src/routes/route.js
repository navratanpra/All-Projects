const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const bookController = require("../controller/bookController");
const authContoller = require("../auth/auth");
const reviewController = require("../controller/reviewController");
const aws = require("aws-sdk");

router.get("/test-me", function (req, res) {
  res.send("this is successfully created");
});

aws.config.update({
  accessKeyId: "AKIAY3L35MCRZNIRGT6N",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: "abc/" + file.originalname,
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      console.log(data);
      console.log("file uploaded succesfully");
      return resolve(data.Location);
    });
  });
};

router.post("/write-file-aws", async function (req, res) {
  try {
    let files = req.files;
    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0]);
      res
        .status(201)
        .send({ msg: "file uploaded succesfully", data: uploadedFileURL });
    } else {
      res.status(400).send({ msg: "No file found" });
    }
  } catch (err) {
    res.status(500).send({ msg: err });
  }
});

router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.post(
  "/books",
  authContoller.authentication,
  authContoller.authorization,
  bookController.createBook
);
router.get("/books", authContoller.authentication, bookController.fetchbooks);
router.get(
  "/books/:bookId",
  authContoller.authentication,
  bookController.getBooks
);
router.put(
  "/books/:bookId",
  authContoller.authentication,
  authContoller.authorization1,
  bookController.updateBook
);
router.delete(
  "/books/:bookId",
  authContoller.authentication,
  authContoller.authorization1,
  bookController.deleteBook
);
router.post("/books/:bookId/review", reviewController.createReview);
router.put("/books/:bookId/review/:reviewId", reviewController.updateReview);
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview);
module.exports = router;
