const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = 8080; // default port 8080
const SHORT_URL_LENGTH = 6;
const COOKIE_USER_ID = "user_id";

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  //Will receive user objects such as:
  /*
    userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
  */
};

const getUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return (users[user]);
    }
  }

  return (null);
};

const generateRandomCharCode = () => {
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
    user: users[req.cookies[COOKIE_USER_ID]]
  };

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies[COOKIE_USER_ID]) {
    res.status(403).send("Access denied! This feature is available only to registered users.");
  } else {
    const tinyId = generateRandomString();

    urlDatabase[tinyId] = req.body.longURL;

    res.redirect("/urls/" + tinyId);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies[COOKIE_USER_ID]) {
    res.redirect("/login");
  } else {    
    const templateVars = { 
      user: users[req.cookies[COOKIE_USER_ID]]
    };
    
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies[COOKIE_USER_ID]]
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
  if (urlDatabase[req.params.id]) {
    res.redirect(urlDatabase[req.params.id]);
  } else {
    res.status(400).send("The TinyURL informed does not exists.");
  }
  
});

app.get("/login", (req, res) => {
  if (req.cookies[COOKIE_USER_ID]) {
    res.redirect("/urls");
  } else {
    const templateVars = { 
      user: undefined
    };

    res.render("users_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const userFound = getUserByEmail(req.body.email);

  if (!userFound || userFound.password !== req.body.password) {
    res.status(403).send("Wrong email and/or password")
  } else {
    res.cookie(COOKIE_USER_ID, userFound.id);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_USER_ID);
  
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.cookies[COOKIE_USER_ID]) {
    res.redirect("/urls");
  } else {
    const templateVars = { 
      user: users[req.cookies[COOKIE_USER_ID]]
    };
  
    res.render("users_new", templateVars);
  }
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Email and/or password cannot be empty")
  } else if  (getUserByEmail(req.body.email)) {
    res.status(400).send("This user is already registered")
  } else {
    const userID = generateRandomString();

    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    
    res.cookie(COOKIE_USER_ID, userID);
    
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});