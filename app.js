const express = require(`express`);
const bodyParser = require(`body-parser`);
const ejs = require(`ejs`);
const mongoose = require(`mongoose`);
const app = express();
const _ = require("lodash");
const encrypt = require(`mongoose-encryption`);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/secretsDB");

const usersSchema = new mongoose.Schema({
  email: String,
  password: String,
});

var encKey = "Thisisasecrentencrpytionkey";

//encrpy only password using enckey
usersSchema.plugin(encrypt, { secret: encKey, encryptedFields: ["password"] });

const usersModel = mongoose.model(`users`, usersSchema);

app.post(`/register`, (req, res) => {
  const newUser = new usersModel({
    email: req.body.username,
    password: req.body.password,
  });

  newUser.save((err) => {
    if (err) {
      console.log(err, `Registration Failed`);
    } else {
      console.log(`Successfilly Registered the User`);
      res.redirect(`/login`);
    }
  });

  // usersModel.insertMany(
  //   { email: newUser.username, password: newUser.password },
  //   (err, result) => {
  //     if (err) {
  //       console.log(err, `Registration Failed`);
  //     } else {
  //       console.log(`Successfilly Registered the User`, result);
  //       res.redirect(`/login`);
  //     }
  //   }
  // );
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
      if (result.password === newUser.password) {
        res.render(`secrets`);
      } else {
        console.log("Wrong  Credentials Entered!");
        res.send("Wrong  Credentials Entered!");
      }
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
