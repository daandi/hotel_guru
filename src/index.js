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
    'LaunchRequest': function(){ 
        this.emit('AMAZON.HelpIntent') 
    },
    'GetPassionHotel': function(){
        const passion = this.event.request.intent.slots.PASSION.value;
        const hotel = this.event.request.intent.slots.HOTEL.value;
        console.log('passion:' + passion + " " + "hotel:" + hotel);

        if (! passion == null) {
            this.attributes[PASSION_KEY] = passion;
        }
        if (! hotel == null) {
            this.attributes[HOTEL_KEY] = hotel;
        }

        if(this.attributes[PASSION_KEY] == null && passion == null) {
            this.emit(':ask', "Zu welchem Thema möchtest du etwas wissen?", "Sage z.B. Zum Thema Essen.");
        } 

        if(this.attributes[HOTEL_KEY] == null && hotel == null) {
            this.emit(':ask', "Zu welchem Hotel möchtest du etwas wissen?", "Sage z.B. Hotel Dana Beach oder Das Adlon Berlin");
        }

        console.log('Got passion and hotel: passion:' + passion + " " + "hotel:" + hotel);

        psc.getHotelUUID(hotel).then(hotelObj => {
          psc.getHotelReviews(hotelObj.id, passion).then( reviewResult => {
          const answer = `Holidaycheck Urlauber zum Thema ${passion} im ${hotelObj.name} <break time="1.5s"/>  ${reviewResult}`;
            const imageObj = {
                smallImageUrl: `https://media-cdn.holidaycheck.com/w_310,h_280,c_fill,q_80/ugc/images/${hotelObj.id}`,
                largeImageUrl: `https://media-cdn.holidaycheck.com/w_1920,h_1080,c_fit,q_80/ugc/images/${hotelObj.id}`
            };

            this.emit(':tellWithCard', answer, hotelObj.name, `--`, imageObj);
        });//failure not handled
      }).error( (err) => {
          this.attributes[HOTEL_KEY] = null;
          this.emit(':ask', `Zu ${hotel} weiß ich leider nichts. Du kannst mich aber gerne zu einem anderen Hotel fragen.`, "Sage z.B. Hotel Dana Beach oder Das Adlon Berlin");
      });
    },
    'GetHotel': function() {
        const hotel = this.event.request.intent.slots.HOTEL.value;
            if (! hotel == null) {
            this.attributes[HOTEL_KEY] = hotel;
        }
        const passion = this.attributes[PASSION_KEY];
        if(passion == null) {
             this.emit(':ask', "Zu welchem Thema möchtest du etwas wissen?", "Sage z.B. Zum Thema Essen.");
        }
        this.emit('GetPassionHotel');
    },
    'GetPassion':function(){
        const passion = this.event.request.intent.slots.PASSION.value;
         if (! passion == null) {
            this.attributes[PASSION_KEY] = passion;
        }
         if(this.attributes[HOTEL_KEY] == null) {
             this.emit(':ask', "Zu welchem Hotel möchtest du etwas wissen?", "Sage z.B. Hotel Dana Beach oder Das Adlon Berlin");
        }
        this.emit('GetPassionHotel');
    },
    'AMAZON.HelpIntent': function() {
        const speechOutput = this.t("HELP_MESSAGE");
        const reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
};