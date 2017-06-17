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
    admin.database().ref('/crimedata').child('offense_code_group').orderByKey().once('value', snapshot => {
      console.log('Offense Code Group:', snapshot.key);
      if (result[snapshot.val()]) {
        result[snapshot.val()]+= 1;
      } else {
        result[crimeSnapshot.val().offense_code_group] = 1;
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

  
