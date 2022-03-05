require("dotenv").config();
const express = require(`express`);
const bodyParser = require(`body-parser`);
const ejs = require(`ejs`);
const mongoose = require(`mongoose`);
// const _ = require("lodash");
// const md5 = require(`md5`);
// const encrypt = require(`mongoose-encryption`);
const bcrypt = require("bcrypt");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Bcrypt
const saltRounds = 10;

mongoose.connect("mongodb://localhost:27017/secretsDB");

const usersSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// console.log(process.env.SECRET);

//encrpyt only password using enckey
// usersSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });

const usersModel = mongoose.model(`users`, usersSchema);

app.post(`/register`, (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    if (err) console.log(err);
    const newUser = new usersModel({
      email: req.body.username,
      password: hash,
    });
    newUser.save((err) => {
      if (err) {
        console.log(err, `Registration Failed`);
      } else {
        console.log(`Successfilly Registered the User`);
        res.redirect(`/login`);
      }
    });
  });
});

app.post(`/login`, (req, res) => {
  const newUser = {
    email: req.body.username,
    password: req.body.password,
  };

  usersModel.findOne({ email: newUser.email }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      bcrypt.compare(newUser.password, result.password, function (err, data) {
        // result == true
        if (data === true) {
          res.render(`secrets`);
        } else {
          console.log("Wrong  Credentials Entered!");
          res.send("Wrong  Credentials Entered!");
        }
      });
    }
  });
});

app.get("/", (req, res) => {
  res.render(`home`);
});

app.get("/register", (req, res) => {
  res.render(`register`);
});

app.get("/login", (req, res) => {
  res.render(`login`);
});

app.get("/logout", (req, res) => {
  res.redirect(`/`);
});

//app listeing to port 3000 or dynamic port
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000...");
});
