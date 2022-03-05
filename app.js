require("dotenv").config();
const express = require(`express`);
const bodyParser = require(`body-parser`);
const ejs = require(`ejs`);
const mongoose = require(`mongoose`);
// const _ = require("lodash");
// const md5 = require(`md5`);
// const encrypt = require(`mongoose-encryption`);
// const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require(`passport`);
const passportLocalMongoose = require(`passport-local-mongoose`);
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Bcrypt
// const saltRounds = 10;

app.use(
  session({
    secret: process.env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretsDB");

const usersSchema = new mongoose.Schema({
  email: String,
  password: String,
});

usersSchema.plugin(passportLocalMongoose);

// console.log(process.env.SECRET);

//encrpyt only password using enckey
// usersSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });

const usersModel = mongoose.model(`users`, usersSchema);

passport.use(usersModel.createStrategy());
passport.serializeUser(usersModel.serializeUser());
passport.deserializeUser(usersModel.deserializeUser());

app.post(`/register`, (req, res) => {
  usersModel.register(
    { username: req.body.username, active: false },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect(`/register`);
      }
      passport.authenticate("local")(req, res, () => {
        res.redirect(`/secrets`);
      });
    }
  );
});

app.post("/login", passport.authenticate("local"), function (req, res) {
  const user = new usersModel({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/secrets");
    }
  });
});

// login with BUG
/*
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),

  function (req, res) {
    res.redirect("/secrets");
  }
);
*/
// app.post(`/login`, passport.authenticate("local"), (req, res) => {
//   const user = new usersModel({
//     username: req.body.username,
//     password: req.body.password,
//   });

//   req.login(user, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       passport.authenticate("local")(req, res, () => {
//         res.redirect(`/secrets`);
//       });
//     }
//   });
// });

app.get("/", (req, res) => {
  res.render(`home`);
});

app.get("/register", (req, res) => {
  res.render(`register`);
});

app.get("/secrets", function (req, res) {
  // The below line was added so we can't display the "/secrets" page
  // after we logged out using the "back" button of the browser, which
  // would normally display the browser cache and thus expose the
  // "/secrets" page we want to protect. Code taken from this post.
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0"
  );
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render(`login`);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect(`/`);
});

//app listeing to port 3000 or dynamic port
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running at port 3000...");
});
