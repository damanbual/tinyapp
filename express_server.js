
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

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
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// Route to render the new URL submission form
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// Route to display a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { 
    id, 
    longURL, 
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// Function to generate a random short URL ID
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// Route to handle form submission for creating a new shortened URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Route to handle short URL redirection
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('Short URL not found');
  }
});

// Route to handle deletion of a URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Route to handle updating of a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});

// Route to handle user login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

// Route to handle user logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls"); 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});