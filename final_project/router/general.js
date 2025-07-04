const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const results = [];

  for (let key in books) {
    if (books[key].author === author) {
      results.push({ isbn: key, ...books[key] });
    }
  }

  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const results = [];

  for (let key in books) {
    if (books[key].title === title) {
      results.push({ isbn: key, ...books[key] });
    }
  }

  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Reviews not found for this book" });
  }
});

public_users.get('/async/books', async (req, res) => {
  try {
    const getBooks = async () => books;
    const data = await getBooks();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const getBookByISBN = async (isbn) => books[isbn];
    const data = await getBookByISBN(req.params.isbn);

    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving book" });
  }
});

public_users.get('/async/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const getBooksByAuthor = async () => {
      let matches = [];
      for (let key in books) {
        if (books[key].author === author) {
          matches.push({ isbn: key, ...books[key] });
        }
      }
      return matches;
    };

    const results = await getBooksByAuthor();

    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving author data" });
  }
});

public_users.get('/async/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const getBooksByTitle = async () => {
      let matches = [];
      for (let key in books) {
        if (books[key].title === title) {
          matches.push({ isbn: key, ...books[key] });
        }
      }
      return matches;
    };

    const results = await getBooksByTitle();

    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving title data" });
  }
});

module.exports.general = public_users;
