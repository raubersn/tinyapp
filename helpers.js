const SHORT_URL_LENGTH = 6;

//returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (id, urlDatabase) => {
  const userURL = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURL[url] = urlDatabase[url];
    }
  }

  return (userURL);
};

//generates a random char
const generateRandomCharCode = () => {
  const min = 48; // 0 (ASCII code)
  const max = 122; // z (ASCII code)

  let charCode = Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive

  //eliminating invalid values
  if (((charCode > 57) && (charCode < 65)) || ((charCode > 90) && (charCode < 97))) {
    charCode = generateRandomCharCode();
  }
  
  return (charCode);
};

//generates a random string formed by nuumbers, capital and small letters
const generateRandomString = () => {
  let charCodes = '';

  //while the string's length is smaller than the specified, calls a helper function to provide one char at a time
  while (charCodes.length < SHORT_URL_LENGTH) {
    //convert the numeric value into a char, according tho the Unicode
    charCodes += String.fromCharCode(generateRandomCharCode());
  }

  return (charCodes);
};

//returns the user within the database which helds the provided e-mail, or null if no user is found
const getUserByEmail = (email, userDatabase) => {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return (userDatabase[user]);
    }
  }

  return (null);
};

//exporting the function to be used on another module
module.exports = {getUserByEmail, urlsForUser, generateRandomString};