const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = 8080; // default port 8080
const SHORT_URL_LENGTH = 6;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomCharCode() {
  const min = 48; // 0 (ASCII code)
  const max = 122; // z (ASCII code)

  let charCode = Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive

  //eliminating invalid values
  if (((charCode > 57) && (charCode < 65)) || ((charCode > 90) && (charCode < 97))) {
    charCode = generateRandomCharCode();
  }
  
  return (charCode);
}

const generateRandomString = () => {
  let charCodes = '';

  while (charCodes.length < SHORT_URL_LENGTH) {
    charCodes += String.fromCharCode(generateRandomCharCode());
  }

  return (charCodes);
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

//serious stuff
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const tinyId = generateRandomString();

  urlDatabase[tinyId] = req.body.longURL;

  res.redirect("/urls/" + tinyId);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  };
  
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
   };

  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id]);  
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});