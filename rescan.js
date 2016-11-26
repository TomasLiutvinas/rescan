console.log('butai son');

var REScan = require ('./functionslel.js');

var flats = [];
var lastPageFetched = false;

function processShit(htmlResponse){
    if(htmlResponse){
        console.log('Response: found');        
        console.log(htmlResponse.toString());
    }else{
        console.log('Response: empty');
    }
};

pullData(1);

function pullData(page){
    var url = 'http://www.aruodas.lt/butai/visi-miestai/?obj=1&mod=Siulo&act=makeSearch&Page=' + page;
    REScan.DoUrlRequest(url, collectFlatInfo, processFlatInfo, {Page:page});
    console.log(page);
}

function collectFlatInfo(response, processing, extraData){
    var jquery = require('jquery');
    var jsdom = require("jsdom");

    jsdom.env(
          response,
          ["http://code.jquery.com/jquery.js"],
          function (err, window) {
            var $ = window.$;
            var pages = parseInt($($('a.page-bt')[$('a.page-bt').length-2]).text());

            var rows = $('table.list-search .list-row')
            if(rows.length > 0){
                for(var i = 0; i < rows.length; i++){
                    var foundBanner = $(rows[i]).find('td .lazybanner') && $(rows[i]).find('td .lazybanner').length > 0;
                    if(!foundBanner){
                        flat = {};
                        flat.imageUrl = $(rows[i]).find('div.list-photo img').attr('src');
                        flat.url = $(rows[i]).find('div.list-photo a').prop('href');
                        flat.ids = [];
                        var parts = flat.url.split('-');
                        var thisID = parts[parts.length-1].replace('/', '');
                        flat.ids.push(thisID);
                        flat.address = $(rows[i]).find('td.list-adress  a').text();
                        flat.rooms = parseInt($($(rows[i]).find('td')[2]).text());
                        flat.area = parseInt($($(rows[i]).find('td')[3]).text());
                        flat.floor = $($(rows[i]).find('td')[4]).text();
                        flat.phones = [];

                        flat.priceHistory = [];
                        var price = $(rows[i]).find('td span.list-item-price').text().match(/\d/g);
                        var priceHistory = {
                            date: REScan.GetToday(),
                            price: price ? price.join("") : null,
                            url: $(rows[i]).find('td.list-adress a').attr('href')
                        }
                        flat.priceHistory.push(priceHistory);
                        flats.push(flat);
                        var data = {ID:thisID};
                        if(!data.ID){
                            debugger;
                        }
                        REScan.DoUrlRequest(flat.url, collectInternalInfo, processInternalInfo, data);
                    }
                }
                pullData(++extraData.Page);
                processing(flats);
            }else{
                console.log('done');
            }
          }
        );
}

function processFlatInfo(){
    for(var i = 0; i < flats.length; i ++){
        //console.log(flats[i]);    
    }
    console.log(flats.length);
}

function processInternalInfo(extraData){
    //console.log(extraData.ID);
    //console.log(extraData.phones);
    if(extraData && extraData.ID){
        var elementPos = flats.map(function(flat) {
            for(var i = 0; i < flat.ids.length; i++){
                return flat.ids[i];     
            }
        }).indexOf(extraData.ID);

        flats[elementPos].phones = extraData.phones;    
    }
    
}

function collectInternalInfo(response, processing, extraData){
    var jquery = require('jquery');
    var jsdom = require("jsdom");

    jsdom.env(
      response,
      ["http://code.jquery.com/jquery.js"],
      function (err, window) {
        var $ = window.$;
        extraData.phones = [];
        var phoneLine = $('div.phone').text().match(/\d/g).join("");
        var phones = phoneLine.split('370');
        for(var i = 1; i < phones.length; i++){
            extraData.phones.push('+370' + phones[i]);
        }        
        processing(extraData);
      }
    );
}

 /*
uniqueIdentifiers:
area
address
rooms
floor
*/

// var flat = {
//     imageUrl:'',
//     address:'',
//     rooms:0,
//     area:0,
//     floor:"",
//     price:[
//         {
//             date:"",
//             price:0
//             //price per square (price/area)
//         }
//     ]
// };

