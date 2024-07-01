
import { assert } from 'chai';
import { getUserByEmail, urlsForUser } from '../helpers/helpers.js';

// Test data
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

const testUrlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
  "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null with an invalid email', function() {
    const user = getUserByEmail("notfound@example.com", testUsers);
    assert.isNull(user);
  });
});

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
    };
    const result = urlsForUser('user1', testUrlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the user has no urls', function() {
    const result = urlsForUser('nonexistentUser', testUrlDatabase);
    assert.deepEqual(result, {});
  });

  it('should return an empty object if there are no urls in the urlDatabase', function() {
    const result = urlsForUser('user1', {});
    assert.deepEqual(result, {});
  });

  it('should not return urls that don\'t belong to the specified user', function() {
    const result = urlsForUser('user2', testUrlDatabase);
    const expectedOutput = {
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2" }
    };
    assert.deepEqual(result, expectedOutput);
  });
});