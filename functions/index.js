/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();

const app = express();

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { key } = req.query;

  return admin.firestore().collection("sets").doc(id)
    .get()
    .then(result => {
      const { items, defaultValue } = result.data();
      const item = items.find(item => item.key == key)
      console.log({item})
      res.json(item?.value || defaultValue);
    })
});

exports.api = functions.https.onRequest(app);
