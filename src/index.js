'use strict';

const Alexa = require('alexa-sdk');
const PassionSearchClient= require('./lib/passion_search_client.js');
const psc = new PassionSearchClient();

const APP_ID = 'Hotel Guru';
const PASSION_KEY = 'passion';
const HOTEL_KEY = 'hotel';

const languageStrings = {
    'de-DE': {
        'translation': {
            'SKILL_NAME' : 'Holidaycheck Hotel Guru',
            'HELP_MESSAGE' : 'Wie sind die Zimmer im Adlon Berlin - Wie ist das Wasser im Dana Beach',
            'HELP_REPROMPT' : 'Wie kann ich dir helfen?',
            'STOP_MESSAGE' : 'Ich hoffe ich konnte dir helfen mehr über das Hotel zu erfahren'
        }
    }
};

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


const handlers = {
    'LaunchRequest': () => this.emit('AMAZON.HelpIntent'),
    'GetPassionHotel': () => {

        const passion = this.event.request.intent.slots.PASSION.value;
        const hotel = this.event.request.intent.slots.HOTEL.value;
        console.log('passion:' + passion + " " + "hotel:" + hotel);

        if (! passion == null) {
            this.session[PASSION_KEY] = passion;
        }
        if (! hotel == null) {
            this.session[HOTEL_KEY] = hotel;
        }

        if(this.session[PASSION_KEY] == null) {
            this.emit(':ask', "Zu welchem Thema möchtest du etwas wissen?", "Sage z.B. Zum Thema Essen.");
        } 

        if(this.session[HOTEL_KEY] == null) {
            this.emit(':ask', "Zu welchem Hotel möchtest du etwas wissen?", "Sage z.B. Hotel Dana Beach oder Das Adlon Berlin");
        }

        console.log('Got passion and hotel: passion:' + passion + " " + "hotel:" + hotel);
        psc.getHotelUUID(hotel).then(hotelObj => {
          psc.getHotelReviews(hotelObj.id, passion).then( reviewResult => {
          const answer =
            `Holidaycheck Urlauber zum Thema ${passion} im ${hotelObj.name} <break time="1.5s"/>  ${reviewResult}`;

            const imageObj = {
                smallImageUrl: `https://media-cdn.holidaycheck.com/w_310,h_280,c_fill,q_80/ugc/images/${hotelObj.id}`,
                largeImageUrl: `https://media-cdn.holidaycheck.com/w_1920,h_1080,c_fit,q_80/ugc/images/${hotelObj.id}`
            };

            this.emit(':tellWithCard', answer, hotelObj.name, `--`, imageObj);
        });
      });
    },
    'GetHotel': () => {
        const hotel = this.event.request.intent.slots.HOTEL.value;
         if (! hotel == null) {
            session[HOTEL_KEY] = hotel;
        }
        if(this.session[PASSION_KEY] == null) {
             this.emit(':ask', "Zu welchem Thema möchtest du etwas wissen?", "Sage z.B. Zum Thema Essen.");
        }
        this.emit('GetPassionHotel');
    },
    'GetPassion': () => {
        const passion = this.event.request.intent.slots.PASSION.value;
         if (! passion == null) {
            session[PASSION_KEY] = passion;
        }
         if(this.session[HOTEL_KEY] == null) {
             this.emit(':ask', "Zu welchem Hotel möchtest du etwas wissen?", "Sage z.B. Hotel Dana Beach oder Das Adlon Berlin");
        }
        this.emit('GetPassionHotel');
    },
    'AMAZON.HelpIntent':  () => {
        const speechOutput = this.t("HELP_MESSAGE");
        const reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': () => {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': () => {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
};