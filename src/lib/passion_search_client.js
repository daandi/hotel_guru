'use strict';

var _ = require('lodash');
var rp = require('request-promise');
var PASSION_ENDPOINT = 'https://www.holidaycheck.de/svc/review-search-api/passion';
var REVIEW_ENDPOINT = 'https://www.holidaycheck.de/svc/review-search-api/review-search'
var SEARCH_ENDPOINT = 'https://www.holidaycheck.de/svc/search-api/search'
var HOTEL_API_ENDPOINT = 'http://www.holidaycheck.com/svc/api-hotel/v3/hotel'
var TENANT = 'passion_alexa';

function PassionSearchClient() {};

PassionSearchClient.prototype.getPassion = function(passion) {
};

PassionSearchClient.prototype.passionInfo = function(passion) {
  return this.getPassion(passion).then(
    function(response) {
      console.log('success - received passion info for ' + passion);
      var aggs = response.body.aggregations;
      var helper = {
        passion : passion,
        hotels : aggs.hotels.map(function(hotel){return hotel.name;}).toString(),
        regions: aggs.regions.map(function(region){return region.name;}).toString()
      }

      return 'Die beliebtesten Reiseziele zum ' + passion + ' sind ' + helper.regions +
      '. Die besten Hotels zum ' + passion + ' sind ' + helper.hotels + '.' ;
    }
  );
};


PassionSearchClient.prototype.getPassion = function(passion) {
  var options = {
    method: 'GET',
    uri: PASSION_ENDPOINT,
    qs: {
      tenant: TENANT,
      destLimit: 3,
      hotelLimit: 3,
      query: passion
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

PassionSearchClient.prototype.getPassionRegion = function(passion) {
  var options = {
    method: 'GET',
    uri: PASSION_ENDPOINT,
    qs: {
      tenant: TENANT,
      destLimit: 1,
      hotelLimit: 0,
      query: passion
    },
    resolveWithFullResponse: true,
    json: true
  };
    return rp(options).then(response => {
      return response.body.aggregations.regions[0];
    });
};

PassionSearchClient.prototype.getPassionHotel = ((passion, destinationUUID)=> {
  const options = {
    method: 'GET',
    uri: PASSION_ENDPOINT,
    qs: {
      tenant: TENANT,
      destLimit: 0,
      hotelLimit: 1,
      destUUID: destinationUUID,
      query: passion
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options).then(response => {
    return response.body.aggregations.hotels[0];
  });
})

PassionSearchClient.prototype.getHotelDetails = (hotelUUID => {
  const options = {
    method: 'GET',
    uri: HOTEL_API_ENDPOINT + "/" + hotelUUID,
    resolveWithFullResponse: true,
    json: true
  };
  // sterne, weiterempfehlungsrate
  return rp(options).then(response => {
    return {
      stars : response.body.stars,
      recommendation: Math.floor(response.body.reviewCalculations.overall.recommendation * 100)
    }
  });
})

PassionSearchClient.prototype.getHotelReviews = function(hotelUUID, passion) {
  var options = {
    method: 'GET',
    uri: REVIEW_ENDPOINT,
    qs: {
      tenant: TENANT,
      limit: 3,
      query: passion,
      hotelUUID: hotelUUID
    },
    resolveWithFullResponse: true,
    json: true
  };

  return rp(options).then(resp => {
    const reviews = resp.body.reviews;
    var answer = "";
    const pause = '<break time="1s"/>';
    reviews.map(data => {
        answer += `${data.review.user.name} sagt: `;

      const t = data.highlights;
      if(t.title != undefined) {
        answer += t.title + pause;
      }

      if(t["texts.sport"] != undefined) {
        answer += t["texts.sport"] + pause;
      }
      if(t["texts.general"] != undefined) {
        answer += t["texts.general"] + pause;
      }
      if(t["texts.hotel"] != undefined) {
        answer +=t["texts.hotel"] + pause;
      }
      if(t["texts.service"] != undefined) {
        answer += t["texts.service"] + pause;
      }
      if(t["texts.food"] != undefined) {
        answer += t["texts.food"] + pause;
      }
      if(t["texts.location"] != undefined) {
        answer += t["texts.location"] + pause;
      }

    });
    return answer.replace(/<\/?em>/g,"");
  });
};

PassionSearchClient.prototype.getDestinationUUID = function(destination) {
  var options = {
    method: 'GET',
    uri: SEARCH_ENDPOINT,
    qs: {
      tenant: TENANT,
      limit: 1,
      type: 'dest',
      query: destination
    },
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options).then(res => res.body.destinations.entities[0]);
};

PassionSearchClient.prototype.getHotelUUID = function(hotel) {
  var options = {
    method: 'GET',
    uri: SEARCH_ENDPOINT,
    qs: {
      tenant: TENANT,
      limit: 1,
      type: 'hotel',
      query: hotel
    },
    resolveWithFullResponse: true,
    json: true
  };

  return rp(options).then(res => res.body.hotels.entities[0]);
};

module.exports = PassionSearchClient;
