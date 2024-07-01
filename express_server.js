
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Global users object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Function to generate a random short URL ID
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Helper function to find user by email
const getUserByEmail = (email, users) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Helper function to get URLs for a specific user
const urlsForUser = (id) => {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

//  Route to handle user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  
  // Check if email or password are empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  }

  // Check if email already exists
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already exists");
  }

  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userId] = {
    id: userId,
    email,
    password: hashedPassword,
  };

  res.cookie("user_id", userId);
  console.log(users); // debugging
  res.redirect("/urls");
});

// Route to render the homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route to send the URL database as JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to send a simple Hello World HTML page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Route to display the list of URLs
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(403).send("You must be logged in to view URLs.");
  }
  const templateVars = {
    urls: urlsForUser(user.id),
    user
  };
  res.render("urls_index", templateVars);
});

// Route to render the new URL submission form
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.redirect("/login"); // Redirect if user is not logged in
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// Route to display a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!user) {
    return res.status(403).send("You must be logged in to view this URL.");
  }
  if (!url) {
    return res.status(404).send("Short URL not found.");
  }
  if (url.userID !== user.id) {
    return res.status(403).send("You do not own this URL.");
  }
  const templateVars = {
    id: shortURL,
    longURL: url.longURL,
    user
  };
  res.render("urls_show", templateVars);
});

// Route to handle form submission for creating a new shortened URL
app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(403).send("You must be logged in to create a short URL.");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user.id
  };
  res.redirect(`/urls/${shortURL}`);
});

// Route to handle short URL redirection
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (!longURL) {
    return res.status(404).send("Short URL not found.");
  }
  res.redirect(longURL);
});

// Route to handle updating of a URL
app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];

  if (!user) {
    return res.status(403).send("You must be logged in to edit a URL.");
  }
  if (!url) {
    return res.status(404).send("Short URL not found.");
  }
  if (url.userID !== user.id) {
    return res.status(403).send("You do not own this URL.");
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// Route to handle deletion of a URL
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];

  if (!user) {
    return res.status(403).send("You must be logged in to delete a URL.");
  }
  if (!url) {
    return res.status(404).send("Short URL not found.");
  }
  if (url.userID !== user.id) {
    return res.status(403).send("You do not own this URL.");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Route to handle user login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  // Check if user exists and password matches
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Email or password is incorrect");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Route to handle user logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Route to render the login form
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("/urls"); // Redirect if user is logged in
  }
  const templateVars = { user };
  res.render("login", templateVars);
});

//  Route to render the registration form
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("/urls"); // Redirect if user is logged in
  }
  const templateVars = { user };
  res.render("register", templateVars);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
