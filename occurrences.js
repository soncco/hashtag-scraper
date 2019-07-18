/**
 * ocurrences.js
 * 
 * Get hashtags generated by scraper.js and count its ocurrences and store them in a firebase database.
 */

var admin = require("firebase-admin");

var serviceAccount = require("./auth.json");
var databaseURL = require('./url.js');

// Firebase service auth.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL
});

const db = admin.firestore();

// Existing hashtag collection generated by scraper.js.
const hashtags = db.collection('trends');

const ocurrences = [];

const query = hashtags.get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            const hashtags = doc.data().hashTags;
            if(typeof hashtags !== 'undefined') {
                hashtags.forEach(ht => {
                    let item = {ht};
                    const index = ocurrences.findIndex(x => x.ht === ht);
                    if(index === -1) {
                        item.count = 1;
                        ocurrences.push(item);
                    } else {
                        ocurrences[index].count += 1;
                    }
                })
            }
        });

        ocurrences.forEach( item => {
            db.collection('trendscount').doc(item.ht).set(item)
            .then(function(ref) {
                console.log("Document written with ID: ", item.ht);
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
        })
        
    })
    .catch(err => {
        console.log('Error', err);
    });