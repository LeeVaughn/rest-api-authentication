/* eslint-disable linebreak-style */

'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator');
const nameValidator = check('name')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "name"');
const bcryptjs = require('bcryptjs');

// this array is used to keep track of user records as they are created
const users = [];

// construct a router instance
const router = express.Router();

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
