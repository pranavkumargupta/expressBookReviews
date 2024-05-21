const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


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

async function getBooksAsync() {
    try {
        const response = await axios.get('http://localhost:5000/books');
        return response.data;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const books = await getBooksAsync();
        return res.status(200).send(JSON.stringify(books, null, 4));
    } catch (error) {
        return res.status(500).send({ message: 'Error fetching books' });
    }
});

// Get book details based on ISBN
function getBookByIsbnPromise(isbn) {
    return axios.get(`http://localhost:5000/books/${isbn}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error(`Error fetching book with ISBN ${isbn}:`, error);
            throw error;
        });
}

// Endpoint to get book details by ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByIsbnPromise(isbn)
        .then(book => {
            return res.status(200).json(book);
        })
        .catch(error => {
            return res.status(404).send(`Book not found with ISBN ${isbn}`);
        });
});

// Get book details based on author
async function getBooksByAuthorAsync(author) {
    try {
        const response = await axios.get(`http://localhost:5000/books/author/${author}`); // Change port to 5000
        return response.data;
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error);
        throw error;
    }
}

// Endpoint to get books by author using async-await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();
    try {
        const filteredBooks = await getBooksByAuthorAsync(author);
        if (Object.keys(filteredBooks).length > 0) {
            return res.status(200).send(filteredBooks);
        } else {
            return res.status(404).send(`No books found by author ${req.params.author}`);
        }
    } catch (error) {
        return res.status(500).send({ message: 'Error fetching books' });
    }
});


// Get all books based on title
async function getBooksByTitleAsync(title) {
    try {
        const response = await axios.get(`http://localhost:5000/books/title/${title}`); // Change port to 5000
        return response.data;
    } catch (error) {
        console.error(`Error fetching books by title ${title}:`, error);
        throw error;
    }
}

// Endpoint to get books by title using async-await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();
    try {
        const filteredBooks = await getBooksByTitleAsync(title);
        if (Object.keys(filteredBooks).length > 0) {
            return res.status(200).send(filteredBooks);
        } else {
            return res.status(404).send(`No books found by title ${req.params.title}`);
        }
    } catch (error) {
        return res.status(500).send({ message: 'Error fetching books' });
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
