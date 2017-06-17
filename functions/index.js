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
    if (!event.data.changed()) {
      console.log('Skipping update to same value');
      return;
    }

    console.log("Processing code group write:", event.data.val());
    var ocgRef = admin.database().ref('analytics/offense_code_group');
    return ocgRef.transaction(current_value => {
      if (current_value[event.data.val()]) {
        console.log("Incrementing", event.data.val());
        current_value[event.data.val()]+= 1;
      } else {
        console.log("Incrementing", event.data.val());
        current_value[event.data.val()] = 1;
      }

      if (event.data.previous.exists()) {
        if (current_value[event.data.previous.val()]) {
          console.log("Decrementing", event.data.previous.val());
          current_value[event.data.previous.val()]-= 1;
          if (current_value[event.data.previous.val()] <= 0) {
            delete current_value[event.data.previous.val()];
          }
        }
      }

      return current_value;
    }).then(() => console.log("Transaction committed"));
  });

exports.computeSeverityLevel = functions.database.ref('crimedata/{pushId}/offense_code_group')
  .onWrite(event => {
    console.log('Calculating severity level for', event.params.pushId);
    
    return event.data.ref.parent.child('severity').set("Something");  
  });

  
