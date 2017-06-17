'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.computeCrimePercentages = functions.database.ref('crimedata/{pushId}')
  .onWrite(event => {
    console.log('Recalculating crime percentages for new message', event.params.pushId);    
  });

  
