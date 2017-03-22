'use strict';

const Alexa = require('alexa-sdk');
const PassionSearchClient= require('./lib/passion_search_client.js');
const psc = new PassionSearchClient();

const APP_ID = 'Hotel Guru';
var PASSION_KEY = 'passion';
var HOTEL_KEY = 'hotel';

const languageStrings = {
    'de-DE': {
        'translation': {
            'HELLO_MESSAGES' : ["Hi", "Servus", "Hotel Guru zu deinen Diensten"],
            'SKILL_NAME' : 'Holidaycheck Hotel Guru',
            'HELP_MESSAGES' : [
                'Wie sind die Zimmer im Adlon Berlin',
                'Wie ist das Bier im Westin Grand Munich',
                'Wie sind die Zimmer im Adlon Berlin',
                'Kann man im Bayrischen Hof essen',
                'Wie ist der Pool im Iberostar Fuerteventura'
            ],
            'HELP_REPROMPT' : 'Wie kann ich dir helfen?',
            'STOP_MESSAGES' : [
                'Ich hoffe ich konnte dir helfen mehr über das Hotel zu erfahren',
                'Servus',
                'Hotel Guro out',
                'Gerne zu diensten'
            ]
        }
    }
};

function randomPhrase(myData) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * myData.length);
    return (myData[i]);
}


exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    //alexa.dynamoDBTableName = 'hotel_guru';
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


const handlers = {
    'LaunchRequest': function(){
        this.emit('AMAZON.HelpIntent')
    },
    'GetPassionHotel': function(){
        const passionSlot = this.event.request.intent.slots.PASSION;
        const hotelSlot = this.event.request.intent.slots.HOTEL;

        var passion;
        var hotel;

        if(passionSlot) {
            passion = passionSlot.value;
        }
        else if(this.attributes[PASSION_KEY]) {
            passion = this.attributes[PASSION_KEY];
        }

        if(hotelSlot) {
            hotel = hotelSlot.value;
        }
        else if (this.attributes[HOTEL_KEY]) {
            hotel = this.attributes[HOTEL_KEY];
        }

        console.log('passion:' + passion + " " + "hotel:" + hotel);

        if (passion) {
            this.attributes[PASSION_KEY] = passion;
        }
        if (hotel) {
            this.attributes[HOTEL_KEY] = hotel;
        }

        if(! passion) {
            this.emit(':ask', "Zu welchem Thema möchtest du etwas wissen?", "Sage z.B. Zum Thema Essen.");
        }
        else if(! hotel) {
            this.emit(':ask', "Zu welchem Hotel möchtest du etwas wissen?", "Sage z.B. Hotel Dana Beach oder Das Adlon Berlin");
        }
        else {
            console.log('Got passion and hotel: passion:' + passion + " " + "hotel:" + hotel);

            psc.getHotelUUID(hotel).then( (hotelObj) => {
              psc.getHotelReviewsAsArray(hotelObj.id, passion).then( (answers) => {
                const speechAnswer =
                    `Holidaycheck Urlauber zum Thema ${passion} im ${hotelObj.name} <break time="1.5s"/>  ${psc.reviewsSpeechAnswer(answers)}`;
                const imageObj = {
                    smallImageUrl: `https://media-cdn.holidaycheck.com/w_310,h_280,c_fill,q_80/ugc/images/${hotelObj.id}`,
                    largeImageUrl: `https://media-cdn.holidaycheck.com/w_1920,h_1080,c_fit,q_80/ugc/images/${hotelObj.id}`
                };
                const cardTextAnswer = psc.reviewsTextAnswer(answers);

                this.emit(':tellWithCard', speechAnswer, hotelObj.name, cardTextAnswer, imageObj);
            }).error((err) => {
                  this.attributes[PASSION_KEY] = null;
                  this.emit(':ask', `Zu Passion ${passion} weiß ich leider nichts. Du kannst mich aber gerne zu einem anderen Thema fragen.`, "Sage z.B. Hotel Dana Beach oder Das Adlon Berlin");
            });
          }).error( (err) => {
              this.attributes[HOTEL_KEY] = null;
              this.emit(':ask', `Zu ${hotel} weiß ich leider nichts. Du kannst mich aber gerne zu einem anderen Hotel fragen.`, "Sage z.B. Hotel Dana Beach oder Das Adlon Berlin");
          })
        };
    },
    'GetHotel': function() {
        const hotel = this.event.request.intent.slots.HOTEL.value;
        if (hotel) {
            this.attributes[HOTEL_KEY] = hotel;
        }
        const passion = this.attributes[PASSION_KEY];
        if(! passion) {
             this.emit(':ask', "Zu welchem Thema möchtest du etwas wissen?", "Sage z.B. Zum Thema Essen.");
        }
        else {
            this.emit('GetPassionHotel');
        };
    },
    'GetPassion':function(){
        const passion = this.event.request.intent.slots.PASSION.value;
         if (passion) {
            this.attributes[PASSION_KEY] = passion;
        }
        const hotel = this.attributes[HOTEL_KEY];

        if(! hotel) {
             this.emit(':ask', "Zu welchem Hotel möchtest du etwas wissen?", "Sage z.B. Hotel Dana Beach oder Das Adlon Berlin");
        }
        else {
             this.emit('GetPassionHotel');
        };
    },
    'AMAZON.HelpIntent': function() {
        const speechOutput = randomPhrase(this.t("HELP_MESSAGES"));
        const reprompt = randomPhrase(this.t("HELP_MESSAGES"));
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', randomPhrase(this.t("STOP_MESSAGES")));
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', randomPhrase(this.t("STOP_MESSAGES")));
    }
};