'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
var severDict = {'Larceny From Motor Vehicle' : 0.1, 'Harassment' : 0.2, 'Missing Person Reported ' : 0.3, 
                 'Larceny' : 0.4, 'Robbery' : 0.5, 'Vandalism' : 0.6, 'Investigate Property': 0.7,
                 'Simple Assault' : 0.8, 'Verbal Disputes' : 0.9, 'Medical Assistance' : 0.1, 
                 'Violations' : 0.1, 'Drug Violation' : 0.2, 'Aggravated Assault' : 0.3,
                 'Property Lost' : 0.4, 'Police Service Incidents' : 0.5, 'Towed' : 0.6,
                 'Warrant Arrests' : 0.7, 'Counterfeiting' : 0.8, 'Other' : 0.9,
                 'Motor Vehicle Accident Response  Disorderly Conduct' : 0.2,              
                 'Auto Theft' : 0.1, 'Recovered Stolen Property' : 0.2, 'Restraining Order Violations' : 0.3,    
                 'Firearm Violations' : 0.4, 'Commercial Burglary' : 0.5, 'Investigate Person' : 0.6,             
                 'Residential Burglary' : 0.7, 'Missing Person Located' : 0.8, 'Sex Offender Registration' : 0.9,       
                 'Fraud' : 0.3, 'Confidence Games' : 0.1, 'Evading Fare' : 0.2, 'Auto Theft Recovery' : 0.3,
                 'Assembly or Gathering Violations Other Burglary' : 0.4, 'Indecent Assault' : 0.5,
                 'Property Found' : 0.6, 'License Violation' : 0.7, 'Landlord/Tenant Disputes' : 0.8,
                 'Fire Related Reports' : 0.9, 'Operating Under the Influence' : 0.4, 'Service' : 0.1,
                 'Search Warrants' : 0.2, 'Property Related Damage' : 0.3, 'Prisoner Related Incidents' : 0.4,
                 'Offenses Against Child / Family  Harbor Related Incidents' : 0.5 }
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
  return query.once('value')
    .then(snapshot => {
      console.log("Got snapshot:", snapshot.key);
      snapshot.forEach(child => {
        console.log("Backfilling", child.key);
        updateCrimePercentage(child.val().offense_code_group, null, false);
      });

      resp.status(200).send("Backfill complete!");
    });
});

function updateCrimePercentage(current, previous, previous_exists) {
  var ocgRef = admin.database().ref('analytics/offense_code_group');
  return ocgRef.transaction(current_value => {
    if (!current_value) {
      console.log("Got null current_value, skipping");
      return current_value;
    }

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

  
