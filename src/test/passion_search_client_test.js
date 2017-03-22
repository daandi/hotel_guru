'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;
var _ = require('lodash');

function pickNameAndId(entity) {
  return _.pick(entity,['name','id']);
}

var PassionSearchClient = require('../lib/passion_search_client');

describe('PassionSearchClient', function(){
  var subject = new PassionSearchClient();
  var passion = 'schnorcheln';

  describe('#getPassions', function(){
    it('returns a list of hotels', function() {
      var hotels = subject.getPassion(passion).then( function(obj){
        return _.map(obj.body.aggregations.hotels,pickNameAndId);
      });
      return expect(hotels).to.eventually.deep.include.members([
        {
          "name": "Hotel Tropitel Oasis",
          "id": "1c61daa2-7d0c-3b48-bcf2-76a9ed31093f"},
        {
          "name": "Lahami Bay Beach Resort & Gardens",
          "id": "5f2ae53c-ee3f-393a-9657-377ce73a62d9"}
        ]);
    });

    it('returns a list of regions', function() {
      var regions = subject.getPassion(passion).then( function(obj){
        return _.map(obj.body.aggregations.regions,pickNameAndId);
      });
      return expect(regions).to.eventually.deep.include.members([
        { name: 'Hurghada/Safaga',
          id: '32d07466-3777-3444-a0c8-c9f6c0537d11'},
        { name: 'Marsa Alam/El Quseir',
          id: 'ab21632a-310f-3bdc-b6cc-f04d9d87b7e1'},
        { name: 'Malediven',
          id: '465741da-03ce-31f6-bac1-4e5e5f72da55'}
        ]);
    });
  });

  describe('#passionInfo', function(){
    var passion = 'rodeln';
    it('returns requested passion', function() {
      var res = subject.passionInfo(passion).then(function(obj){
        return obj;
      });
      return expect(res).to.eventually.equal('Die beliebtesten Reiseziele zum rodeln sind Tirol,Bayern,Salzburger Land. Die besten Hotels zum rodeln sind Alpeiner Nature Resort Tirol,Hotel Gutjahr,Familienresort Reslwirt.')
    });
  });

  describe('#getPassionRegion', function(){
    const passion = 'coden';
    it('returns requested passion region', function() {
      var res = subject.getPassionRegion(passion).then(res => res);
      return expect(res.then(pickNameAndId)).to.eventually.deep.equal(
        {
          name: 'Türkische Riviera',
          id: 'b2272a4a-632a-3d45-ac37-389c895ecc74'
        }
      );
    });
  });

  describe('#getPassionHotel', () => {
    const passion = 'baden';
    const mallorcaUUID = 'b2272a4a-632a-3d45-ac37-389c895ecc74'
    it(`returns requested passion hotels in region`, () => {
      var res = subject.getPassionHotel(passion, mallorcaUUID).then(res => res);
      return expect(res.then(pickNameAndId)).to.eventually.deep.equal(
        {
          "id": "f1fd80c7-e4ba-3435-a292-8ace6a55c714",
          "name": "Costa Holiday Club"
        }
      );
    });
  });

  describe('#getDestinationUUID', () => {
    const destination = 'Mallorca';
    const mallorcaUUID = '07f5f656-4acc-3230-b7dd-aec3c13af37c'
    it(`returns the UUID for requested destination`, () => {
      var res = subject.getDestinationUUID(destination).then(res => res);
      return expect(res.then(pickNameAndId)).to.eventually.deep.equal(
        {
          "id": mallorcaUUID,
          "name": destination
        }
      );
    });
  });

  describe('#getHotelUUID', () => {
    const hotelName = 'Dana Beach';
    it(`returns the UUID for requested destination`, () => {
      var res = subject.getHotelUUID(hotelName).then(res => res);
      return expect(res.then(pickNameAndId)).to.eventually.deep.equal(
        {
          "id": "1aa4c4ad-f9ea-3367-a163-8a3a6884d450",
          "name": "Dana Beach Resort"
        }
      );
    });
  });

  describe('#getHotelReviews', () => {
    const hotelUUID = "1aa4c4ad-f9ea-3367-a163-8a3a6884d450";
    const passion = 'essen'
    it(`returns testimonials for ${passion} for hotel`, () => {
      var res = subject.getHotelReviews(hotelUUID, passion).then(res => res);
      return expect(res).to.eventually.contain('Essen');
      });
  });

  describe('#getHotelReviews golf', () => {
    const hotelUUID = "1aa4c4ad-f9ea-3367-a163-8a3a6884d450";
    const passion = 'golf'
    it(`returns testimonials for ${passion} for hotel`, () => {
      var res = subject.getHotelReviews(hotelUUID, passion).then(res => res);
      return expect(res).to.eventually.contain('Golf');
    });
  });


  describe('#getHotelDetails', () => {
    const hotelUUID = '1aa4c4ad-f9ea-3367-a163-8a3a6884d450'
    it(`returns hotel details`, () => {
      var res = subject.getHotelDetails(hotelUUID).then(details => {
        return details;
      });
      return expect(res).to.eventually.deep.equal(
        {
          "stars": 5,
          "recommendation": 97
        }
      );
    });
  });


});
