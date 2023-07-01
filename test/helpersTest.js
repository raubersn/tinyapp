const { assert } = require('chai');

const  getUserByEmail  = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    
    assert.deepEqual(testUsers[expectedUserID], user, `User returned by the email user@example.com should have the ID userRandomID`);    
  });
  it('should return a null value whena user does not exist in the database', function() {
    const user = getUserByEmail("xupeta@galo.com.br", testUsers)
    const expectedUserID = null;
    
    assert.deepEqual(expectedUserID, user, `Function should return undefined when an e-mail is not found in the database`);
  });
});