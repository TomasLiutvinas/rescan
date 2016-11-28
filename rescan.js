console.log('butai son');

var REScan = require ('./functionslel.js');

var flats = [];

var written = 0;

pullData(143);

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
    while(written != flats.length -1){
        var miestas = flats[written].address.split(',')[0];
        var rajonas = flats[written].address.split(',')[1];
        if(rajonas){
            rajonas = rajonas.trim().replace('.','');
        }
        var directory =  miestas + '\\' + rajonas + '\\';
        var file = flats[written].ids[0];
        writeObjectToFile(directory, file, flats[written]);
        written++;
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

function writeObjectToFile(directory, filename, object){
    //direcotory == kaunas\\eiguliai
    //filename == 2341234

    
    var jsonFile = require('jsonfile');
    var dir = 'C:\\Users\\Tomas\\Documents\\GitHub\\rescan\\db\\';

    dir += directory.replace('.', '').replace('.', '');
    jsonFile.spaces = 4;
    var file = dir + filename + '.json';
    ensureDirectoryExistence(file);
    jsonFile.writeFile(file,object, function(err){
    });
}

function ensureDirectoryExistence(filePath) {
  var fs =  require('fs');
  var path = require('path');
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
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

