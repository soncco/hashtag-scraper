/**
 * scraper.js
 * 
 * Retrieve hashtags by day from trendogate.com and store them in a firebase database.
 */

const rp = require('request-promise');  
const cheerio = require('cheerio');
const moment = require('moment');
var admin = require("firebase-admin");

var databaseURL = require('./url.js');


// Firebase service auth.
var serviceAccount = require("./auth.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL
});

const db = admin.firestore();

// Trendogate URL.
const baseURL = 'https://trendogate.com/placebydate/418440';

// Date range (MM/DD/YYYY).
const start = new Date('04/01/2019');
const end = new Date('07/16/2019');

let loop = new Date(start);

const getHashtags = async (date) => {
    const fullUrl = `${baseURL}/${date}`;
    rp.get(fullUrl)
        .then(html => {
            const els = cheerio('.list-group-item a', html);
    
            //  Array of hashtags by day.
            const hashTags = [];
            els.each((i, el) => {
                hashTags.push(cheerio(el).text().trim());
            });


            var obj = {
                'date': moment(date, 'YYYY/MM/DD').toDate(),
                fullUrl,
                hashTags
            }

            // Saving data on database.
            db.collection('trends').doc(date).set(obj)
            .then(function(docRef) {
                console.log("Document written with ID: ", date);
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
        })
        .catch(e => console.log(e));
};

while(loop <= end) {
    const theDate = moment(loop).format('YYYY-MM-DD');
    const newDate = loop.setDate(loop.getDate() + 1);
    loop = new Date(newDate);
    getHashtags(theDate);
}
