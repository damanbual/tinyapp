
const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Function to get URLs for a specific user
const urlsForUser = function(userId, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    const urlData = urlDatabase[shortURL];
    if (urlData.userID === userId) {
      userUrls[shortURL] = urlData;
    }
  }
  return userUrls;
};

// Exporting the functions
export { getUserByEmail, urlsForUser };