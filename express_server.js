const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  /* secret keys */
  keys: ['Galo', 'Doido'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const PORT = 8080; // default port 8080
const SHORT_URL_LENGTH = 6;
const ACCESS_DENIED = "Access denied! This feature is only available to registered users.";
const NO_PRIVILEGES = "Access denied! You do not have privileges over this TinyURL.";
const UNEXISTING_URL = "The TinyURL informed does not exists.";

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "admin"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "admin"
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

//returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (id) => {
  const userURL = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURL[url] = urlDatabase[url];      
    }
  }

  return (userURL);
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
  if (!req.session.user_id) {
    res.status(403).send(ACCESS_DENIED);
  } else {
    const templateVars = { 
      urls: urlsForUser(req.session.user_id),
      user: users[req.session.user_id]
    };

    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send(ACCESS_DENIED);
  } else {
    const tinyId = generateRandomString();

    urlDatabase[tinyId] = {};
    urlDatabase[tinyId].longURL = req.body.longURL;
    urlDatabase[tinyId].userID = req.session.user_id;

    res.redirect("/urls/" + tinyId);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = { 
      user: users[req.session.user_id]
    };
    
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    res.status(400).send(UNEXISTING_URL);
  } else if (!req.session.user_id) {
    res.status(403).send(ACCESS_DENIED);
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send(NO_PRIVILEGES);
  }  else {
    const templateVars = { 
      id: req.params.id, 
      longURL: urlDatabase[req.params.id].longURL,
      user: users[req.session.user_id]
    };

    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    res.status(400).send(UNEXISTING_URL);
  } else if (!req.session.user_id) {
    res.status(403).send(ACCESS_DENIED);
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send(NO_PRIVILEGES);
  }  else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
  
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    res.status(400).send(UNEXISTING_URL);
  } else if (!req.session.user_id) {
    res.status(403).send(ACCESS_DENIED);
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send(NO_PRIVILEGES);
  }  else {
    delete urlDatabase[req.params.id];

    res.redirect("/urls");
  }
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    res.status(400).send(UNEXISTING_URL);
  }
  
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
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

  if (!userFound || !bcrypt.compareSync(req.body.password, userFound.password)) {
    res.status(403).send("Wrong email and/or password")
  } else {
    req.session.user_id = userFound.id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { 
      user: users[req.session.user_id]
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
      password: bcrypt.hashSync(req.body.password, 10)
    };
    
    req.session.user_id = userID;
    
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});