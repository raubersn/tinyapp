const {getUserByEmail, urlsForUser, generateRandomString} = require('./helpers');
const express = require("express");
//using session cookies instead of cookie parser
const cookieSession = require('cookie-session');
//needed for cookie hashing
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
//messages to be displayed to the user
const ACCESS_DENIED = "Access denied! This feature is only available to registered users.";
const NO_PRIVILEGES = "Access denied! You do not have privileges over this TinyURL.";
const UNEXISTING_URL = "The TinyURL informed does not exists.";

//object simulating a database to store the URLs' data
const urlDatabase = {};
//object simulating a database to store the users' data
const users = {};


//sends a message to the user to confirm connection to the server
app.get("/", (req, res) => {
  res.send("Hello!");
});

//prints the URL database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//sends a message to the user to confirm connection to the server

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//succesfull test of variable scope
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

//unsuccesfull test of variable scope
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

//SERVER ROUTES
//if the user is logged, renders the list of URLS of this user
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    //sends an error message to the user indicating access denied
    res.status(403).send(ACCESS_DENIED);
  } else {
    const templateVars = {
      //returns only the URLs created by this user to be displayed
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user: users[req.session.user_id]
    };

    res.render("urls_index", templateVars);
  }
});

//creates a new TinyURL in the database
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    //sends an error message to the user indicating access denied
    res.status(403).send(ACCESS_DENIED);
  } else {
    //creates the random url id
    const tinyId = generateRandomString();

    //retrieves the information from the form and cookie
    urlDatabase[tinyId] = {};
    urlDatabase[tinyId].longURL = req.body.longURL;
    urlDatabase[tinyId].userID = req.session.user_id;

    res.redirect("/urls/" + tinyId);
  }
});

//renders the form for creating a new TinyURL
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    //if the user is not logged, redirects it to the log in page
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    
    res.render("urls_new", templateVars);
  }
});

//renders the page diplaying the URL's information and allowing it to be updated
app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    //sends an error message to the user indicating the URL requested does not exist
    res.status(400).send(UNEXISTING_URL);
  } else if (!req.session.user_id) {
    //if the user is not logged, sends an error message to the user indicating access denied
    res.status(403).send(ACCESS_DENIED);
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    //if the user didn't create the requested URL, sends an error message indicating access denied
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

//update the long URL of an existing TibnyURL, if the user created it
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    //sends an error message to the user indicating the URL requested does not exist
    res.status(400).send(UNEXISTING_URL);
  } else if (!req.session.user_id) {
    //if the user is not logged, sends an error message to the user indicating access denied
    res.status(403).send(ACCESS_DENIED);
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    //if the user didn't create the requested URL, sends an error message indicating access denied
    res.status(403).send(NO_PRIVILEGES);
  }  else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
  
    res.redirect("/urls");
  }
});

//deletes the TibnyURL, if the user created it
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    //sends an error message to the user indicating the URL requested does not exist
    res.status(400).send(UNEXISTING_URL);
  } else if (!req.session.user_id) {
    //if the user is not logged, sends an error message to the user indicating access denied
    res.status(403).send(ACCESS_DENIED);
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    //if the user didn't create the requested URL, sends an error message indicating access denied
    res.status(403).send(NO_PRIVILEGES);
  }  else {
    delete urlDatabase[req.params.id];

    res.redirect("/urls");
  }
});

//navigates to the long URL of a TinyURL
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    //sends an error message to the user indicating the URL requested does not exist
    res.status(400).send(UNEXISTING_URL);
  }
});

//renders the login page
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    //if the user is already logged in, redirects to the list of URLS
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: undefined
    };

    res.render("users_login", templateVars);
  }
});

//logs the user in if the conditions are satisfied
app.post("/login", (req, res) => {
  const userFound = getUserByEmail(req.body.email, users);

  //if the user was not registered or the password does not match, sends an error message to the user
  if (!userFound || !bcrypt.compareSync(req.body.password, userFound.password)) {
    res.status(403).send("Wrong email and/or password");
  } else {
    //sets the user id as a cookie
    req.session.user_id = userFound.id;
    res.redirect("/urls");
  }
});

//clear the user id cookie and logs the user out
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  
  res.redirect("/login");
});

//renders the page for user registration
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    //if the user is already logged in, redirects to the list of URLS
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
  
    res.render("users_new", templateVars);
  }
});

//creates a new user in the database, if the conditions are satisfied
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    //the user must inform an email and password
    res.status(400).send("Email and/or password cannot be empty");
  } else if  (getUserByEmail(req.body.email, users)) {
    //if the user is already registered, sends an error message
    res.status(400).send("This user is already registered");
  } else {
    //generates the random user id
    const userID = generateRandomString();

    //saves the information containing the hashed password in the database
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    
    //sets the user id cookie
    req.session.user_id = userID;
    
    res.redirect("/urls");
  }
});

//starts the listener on the server on the desired port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});