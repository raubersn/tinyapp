const getUserByEmail = (email, userDatabase) => {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return (userDatabase[user]);
    }
  }

  return (null);
};

module.exports = getUserByEmail;