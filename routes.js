'use strict';

const express = require('express');

// this array is used to keep track of user records as they are created
const users = [];

// construct a router instance
const router = express.Router();

// route that creates a new user
router.post('/users', (req, res) => {
  // get the user from the request body
  const user = req.body;

  // add the user to the `users` array
  users.push(user);

  // set the status to 201 Created and end the response
  res.status(201).end();
});

module.exports = router;
