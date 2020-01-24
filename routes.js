/* eslint-disable linebreak-style */

'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const nameValidator = check('name')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "name"');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');

// this array is used to keep track of user records as they are created
const users = [];

// construct a router instance
const router = express.Router();

const authenticateUser = (req, res, next) => {
  let message = null;
  // parse the user's credentials from the Authorization header
  const credentials = auth(req);

  // if the user's credentials are available...
  if (credentials) {
    // attempt to retrieve the user from the data store by their username (i.e. the user's "key" from the Authorization header)
    const user = users.find(u => u.username === credentials.name);

    // If a user was successfully retrieved from the data store...
    if (user) {
      // use bcryptjs npm package to compare the user's password (from the Authorization header) to the user's password that was retrieved from the data store.
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);

      // If the passwords match...
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.username}`);

        // then store the retrieved user object on the req object so any middleware functions that follow this middleware function will have access to the user's information.
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.username}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  // If user authentication failed...
  if (message) {
    console.warn(message);

    // return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    next();
  }
};

// route that returns the current authenticated user
router.get('/users', authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({ name: user.name, username: user.username });
});

// route that creates a new user
router.post('/users', nameValidator, (req, res) => {
  // attempt to get the validation result from the request object
  const errors = validationResult(req);

  // if there are validation errors
  if (!errors.isEmpty()) {
    // use the array map method to get a list of error messages
    const errorMessages = errors.array().map(error => error.msg);

    // return the validation errors to the client
    return res.status(400).json({ errors: errorMessages });
  }

  // get the user from the request body
  const user = req.body;

  // hash the new user's password
  user.password = bcryptjs.hashSync(user.password);

  // add the user to the `users` array
  users.push(user);

  // set the status to 201 Created and end the response
  res.status(201).end();
});

module.exports = router;
