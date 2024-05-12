const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
  });

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    await res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const myPromise1 = new Promise((resolve, reject)=>{
        const isbn = req.params.isbn;
        if (books[isbn]){
            resolve(books[isbn]);
        }
        else{
            reject('Can\'t find the ISBN');
        }
      });
      
    myPromise1.then((resp)=>{
        res.status(200).json(resp)
    }).catch(
        err=> res.status(403).json({error: err})
    )

});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const myPromise2 = new Promise((resolve, reject)=>{
        const author = req.params.author;
        const getISBN = Object.values(books).filter(value => value.author === author);
        if (getISBN){
            resolve(getISBN);
        }
        else{
            reject('Can\'t find the Author');
        }
    });
      
    myPromise2.then((resp)=>{
        res.status(200).json(resp)
    }).catch(
        err=> res.status(403).json({error: err})
    )

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const myPromise3 = new Promise((resolve, reject)=>{
        const title = req.params.title;
        const getISBN = Object.keys(books).find(key => books[key].title === title);
        if (getISBN){
            resolve(books[getISBN]);
        }
        else{
            reject('Can\'t find the Title');
        }
    });
      
    myPromise3.then((resp)=>{
        res.status(200).json(resp)
    }).catch(
        err=> res.status(403).json({error: err})
    )
    
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]){
        res.send(books[isbn]['reviews'])
    }
    else{
        res.send('Can\'t find the Book or Review');
    }
});

module.exports.general = public_users;
