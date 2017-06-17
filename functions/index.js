'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.computeCrimePercentages = functions.database.ref('crimedata/{pushId}/offense_code_group')
  .onWrite(event => {
    console.log('Recalculating crime percentages for new message', event.params.pushId);    
    var result = {}; 
    admin.database().ref('/crimedata').orderByKey().once('value', entry => {
      if (result[entry.offense_code_group]) {
        result[entry.offense_code_group]+= 1;
      } else {
        result[entry.offense_code_group] = 1;
      }
    });

    console.log("Results:", result);
    admin.database().ref('/analytics').set(result);
  });

exports.computeSeverityLevel = functions.database.ref('crimedata/{pushId}/offense_code_group')
  .onWrite(event => {
    console.log('Calculating severity level for', event.params.pushId);
    
    return event.data.ref.parent.child('severity').set("Something");  
  });

  
