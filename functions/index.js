'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.computeCrimePercentages = functions.database.ref('crimedata/{pushId}/offense_code_group')
  .onWrite(event => {
    console.log('Recalculating crime percentages for new message', event.params.pushId);    
    // Only edit data when it is first created.
    if (event.data.previous.exists() && event.data.val() === event.data.previous.val()) {
      console.log('Skipping update to same value');
      return;
    }

    var ocgRef = db.ref("analytics/offense_code_group/" + data.val());
    return ocgRef.transaction(current_value => {
      return (current_value || 0) + 1;
    });
  });

exports.computeSeverityLevel = functions.database.ref('crimedata/{pushId}/offense_code_group')
  .onWrite(event => {
    console.log('Calculating severity level for', event.params.pushId);
    
    return event.data.ref.parent.child('severity').set("Something");  
  });

  
