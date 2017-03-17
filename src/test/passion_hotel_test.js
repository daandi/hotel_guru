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
        {"session": {
          "sessionId": "SessionId.77ee4e30-d113-4321-919a-a97b3bee4164",
          "application": {
            "applicationId": "amzn1.ask.skill.a71409d2-3006-4f7c-befc-6eb16427f34a"
          },
          "attributes": {},
          "user": {
            "userId": "amzn1.ask.account.AEHRCVUJT3XISAZVLZK4HYWOSII2CJT5ENUGEGDMGUKYFUMO5QLWUUKDLQSH6GRHVZKPKOBM7WSA73A7OER7J36K3VBARBJZM4UV22YE2BF5U3SNBSL4SMUFEN5SIF3MTJXY7AN3JA4YI4LON7UA56EG2E6OODMS4IRLVWTZ5JBEHWGXUHOO57QRGIDYRS43PXNGKSAOGO53FJQ"
          },
          "new": true
        },
        "request": {
          "type": "IntentRequest",
          "requestId": "EdwRequestId.06f171b6-61ed-4523-b525-8be0c2e03aaa",
          "locale": "de-DE",
          "timestamp": "2017-02-16T09:22:51Z",
          "intent": {
            "name": "GetPassionHotel",
            "slots": {
              "PASSION": {
                "name": "PASSION",
                "value": "essen"
              },
              "HOTEL": {
                "name": "HOTEL",
                "value": "dana beach"
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
            expect(speechResponse.response.outputSpeech.ssml).to.equal("<speak> Zum Thema essen im Dana Beach Resort sagen Holidaycheck Urlauber Simone sagt: Leckeres Essen, Sonne und Meer\nUta sagt: Tolles Ambiente mit super Essen\nTomas sagt: Super Freundlich-tolle Anlage-leckeres Essen\n </speak>' to equal '<speak> Die beste Region zum Thema wein trinken ist Türkische Riviera. Möchtest du das beste Hotel ? </speak>")
        })

        it("should not end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
    })
});
