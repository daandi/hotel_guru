'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;
var _ = require('lodash');
var index = require('../index');

const context = require('aws-lambda-mock-context');
const ctx = context();

// taken from https://www.thepolyglotdeveloper.com/2016/08/test-amazon-alexa-skills-offline-with-mocha-and-chai-for-node-js/
describe('Reiseplaner', function(){
  var speechResponse = null
  var speechError = null

  before(function(done){

    index.handler(
      {
        "session": {
          "sessionId": "SessionId.f...",
          "application": {
            "applicationId": "amzn1.ask.skill...."
          },
          "attributes": {},
          "user": {
            "userId": "amzn1.ask.account....."
          },
          "new": true
        },
        "request": {
          "type": "IntentRequest",
          "requestId": "EdwRequestId....",
          "locale": "de-DE",
          "timestamp": "2017-02-13T15:43:13Z",
          "intent": {
            "name": "GetPassion",
            "slots": {
              "PASSION": {
                "name": "PASSION",
                "value": "wein trinken"
              }
            }
          }
        },
        "version": "1.0"
      },
      ctx);

      ctx.Promise
          .then(resp => { speechResponse = resp; done(); })
          .catch(err => { speechError = err; done(); })
      })

  describe("The response is structurally correct for Alexa Speech Services", function() {
        it('should not have errored',function() {
            expect(speechError).to.be.null
        })

        it('should have a version', function() {
            expect(speechResponse.version).not.to.be.null
        })

        it('should have a speechlet response', function() {
            expect(speechResponse.response).not.to.be.null
        })

        it("should have a spoken response", () => {
            expect(speechResponse.response.outputSpeech.ssml).to.equal("<speak> Die beste Region zum Thema wein trinken ist Türkische Riviera. Möchtest du das beste Hotel</speak>")
        })

        it("should not end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.false
        })
    })
});
