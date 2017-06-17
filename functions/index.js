'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
var severDict = {'Larceny From Motor Vehicle' : 1, 'Harassment' : 2, 'Missing Person Reported' : 3, 
                 'Larceny' : 4, 'Robbery' : 5, 'Vandalism' : 6, 'Investigate Property': 7,
                 'Simple Assault' : 8, 'Verbal Disputes' : 9, 'Medical Assistance' : 10, 
                 'Violations' : 11, 'Drug Violation' : 12, 'Aggravated Assault' : 13,
                 'Property Lost' : 14, 'Police Service Incidents' : 15, 'Towed' : 16,
                 'Warrant Arrests' : 17, 'Counterfeiting' : 18, 'Other' : 19,
                 'Motor Vehicle Accident Response  Disorderly Conduct' : 20,              
                 'Auto Theft' : 21, 'Recovered Stolen Property' : 22, 'Restraining Order Violations' : 23,    
                 'Firearm Violations' : 24, 'Commercial Burglary' : 25, 'Investigate Person' : 26,             
                 'Residential Burglary' : 27, 'Missing Person Located' : 28, 'Sex Offender Registration' : 29,       
                 'Fraud' : 30, 'Confidence Games' : 31, 'Evading Fare' : 32, 'Auto Theft Recovery' : 33,
                 'Assembly or Gathering Violations Other Burglary' : 34, 'Indecent Assault' : 35,
                 'Property Found' : 36, 'License Violation' : 37, 'Landlord/Tenant Disputes' : 38,
                 'Fire Related Reports' : 39, 'Operating Under the Influence' : 40, 'Service' : 41,
                 'Search Warrants' : 42, 'Property Related Damage' : 43, 'Prisoner Related Incidents' : 44,
                 'Offenses Against Child / Family  Harbor Related Incidents' : 45 }
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
  var query = admin.database().ref('/crimedata').orderByKey();
  query.once('value')
    .then(snapshot => {
      snapshot.forEach(child => {
        console.log("Backfilling", child.key);
        updateCrimePercentage(child.val().offense_code_group, null, false);
      });

      resp.end();
    });
});

function updateCrimePercentage(current, previous, previous_exists) {
  var ocgRef = admin.database().ref('analytics/offense_code_group');
  return ocgRef.transaction(current_value => {
    if (current_value.hasOwnProperty(current)) {
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
    
    return event.data.ref.parent.child('Severity').set(severDict[event.data.val()]);  
  });

  
