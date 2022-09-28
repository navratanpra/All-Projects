const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { isValid } = require("../validation/validator");

//===========================authentication======================================//

async function authentication(req, res, next) {
  try {
    const token = req.headers["x-api-key"];
    if (!token) {
      return res.status(401).send({ status: false, message: "required token" });
    }
    jwt.verify(token, "plutonium_project3", (err, decoded) => {
      if (err) {
        // let payload=JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        // console.log(payload)
        //   if (payload.exp < (new Date().getTime() + 1) / 1000) {
        //     return res
        //       .status(401)
        //       .send({ status: false, message: "token expired" });
        //   }
        return res
          .status(401)
          .send({ status: false, message: "invalid token" });
      }
      req.decoded = decoded;

      next();
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}

//===========================authorization======================================//

async function authorization(req, res, next) {
  try {
    const userId = req.decoded.userId;
    const data = req.body;
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "require data to create book" });
    }

    if (!data.hasOwnProperty("userId")) {
      return res
        .status(400)
        .send({ status: false, message: "userId is required" });
    }

    if (!isValid(data.userId)) {
      return res
        .status(400)
        .send({ status: false, message: "userId is invalid" });
    }

    const Id = req.body.userId;
    if (!ObjectId.isValid(Id)) {
      return res.status(400).send({
        status: false,
        message: "Given userId is an invalid ObjectId",
      });
    }

    const userDocument = await userModel.findOne({ _id: data.userId });
    if (!userDocument) {
      return res.status(404).send({ status: false, message: "user not found" });
    }

    if (userId !== Id) {
      return res
        .status(403)
        .send({ status: false, message: "user not authorized" });
    }
    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}

//===========================authorization1======================================//

async function authorization1(req, res, next) {
  try {
    const userId = req.decoded.userId;
    const Id = req.params.bookId;

    const errors = [];

    if (Id === ":bookId") {
      errors.push("bookId is required");
    } else {
      if (!ObjectId.isValid(Id)) {
        errors.push("Given bookId is an invalid ObjectId");
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({
        status: false,
        message: `${errors.join(", ")}`,
      });
    }

    const userDocument = await bookModel.findOne({ _id: Id, isDeleted: false });
    if (!userDocument) {
      return res.status(404).send({ status: false, message: "book not found" });
    }

    const pathUserId = userDocument.userId.toString();
    if (userId !== pathUserId) {
      return res
        .status(403)
        .send({ status: false, message: "user not authorized" });
    }
    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}

module.exports = { authentication, authorization, authorization1 };
