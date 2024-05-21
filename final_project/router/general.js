const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).send(`Book not found with ISBN ${isbn}`);
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const filtered_books = {};

    for (const key in books) {
        if (books[key].author.toLowerCase() === author)
            filtered_books[key] = books[key];
    }

    if (Object.keys(filtered_books).length > 0) {
        return res.status(200).send(filtered_books);
    } else {
        return res.status(404).send(`No books found by author ${req.params.author}`);
    }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const filtered_books = {};

    for (const key in books) {
        if (books[key].title.toLowerCase() === title)
            filtered_books[key] = books[key];
    }

    if (Object.keys(filtered_books).length > 0) {
        return res.status(200).send(filtered_books);
    } else {
        return res.status(404).send(`No books found by title ${req.params.title}`);
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).send(`No book found with ISBN ${isbn}`);
    }
});


module.exports.general = public_users;
