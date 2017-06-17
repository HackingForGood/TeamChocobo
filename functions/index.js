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

    return updateCrimePercentage(
      event.data.val(), 
      event.data.previous.val(), 
      event.data.previous.exists());
  });

exports.backfillCrimePercentages = functions.https.onRequest((req, resp) => {
  admin.database().ref('/crimedata').orderByKey().on('value', snapshot => {
    snapshot.forEach(child => {
      updateCrimePercentage(child.offense_code_group, null, false);
    });

    resp.end();
  });    
});

function updateCrimePercentage(current, previous, previous_exists) {
  var ocgRef = admin.database().ref('analytics/offense_code_group');
  return ocgRef.transaction(current_value => {
    if (current_value[current]) {
      console.log("Incrementing", current);
      current_value[current]+= 1;
    } else {
      console.log("Incrementing", current);
      current_value[current] = 1;
    }

    if (previous_exists) {
      if (current_value[previous]) {
        console.log("Decrementing", previous);
        current_value[previous]-= 1;
        if (current_value[previous] <= 0) {
          delete current_value[previous];
        }
      }
    }

    return current_value;
  }).then(() => console.log("Transaction committed"));
}

exports.computeSeverityLevel = functions.database.ref('crimedata/{pushId}/offense_code_group')
  .onWrite(event => {
    console.log('Calculating severity level for', event.params.pushId);
    
    return event.data.ref.parent.child('severity').set("Something");  
  });

  
