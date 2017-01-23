console.log('butai son');

var REScan = require ('./functionslel.js');

var flats = [];

var written = 0;

pullData(1);

function pullData(page){
    var url = 'http://www.aruodas.lt/butai/visi-miestai/?obj=1&mod=Siulo&act=makeSearch&Page=';
    //url = 'http://www.aruodas.lt/butai/kauno-rajone/?obj=1&FRegion=63&mod=Siulo&act=makeSearch&Page=';
    url+=page;
    REScan.DoUrlRequest(url, collectFlatInfo, processFlatInfo, {Page:page});
    console.log('Reading page: ' + page);
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
    while(flats && written != flats.length -1){
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

    if(flats && flats.length){
        console.log('Flats list: ' + flats.length);       
    }
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

    var dir = 'C:\\Users\\Tomas\\Documents\\GitHub\\rescan\\db\\';

    dir += directory.replace('.', '').replace('.', '');
    
    var file = dir + filename + '.json';
    ensureDirectoryExistence(file);
    writeOrUpdateFile(file, object, function(err){if(err){console.log(err);};});
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

function writeOrUpdateFile(file, object, onComplete){
    var jsonFile = require('jsonfile');
    var fs = require('fs');
    jsonFile.spaces = 4;
    if(fs.existsSync(file) && isJsonString(fs.readFileSync(file))){
        var existingItem = jsonFile.readFileSync(file);
        mergeArrays(object.ids,existingItem.ids);
        mergeArrays(object.phones,existingItem.phones);
        object.priceHistory.push.apply(object.priceHistory, existingItem.priceHistory);
        object.priceHistory = distinctPriceHistory(object.priceHistory);
    }
    
    jsonFile.writeFile(file,object, onComplete);
}

function mergeArrays(source, target){
    target.push.apply(target, source);
    target = target.filter(function (x, i, a) { 
    return a.indexOf(x) == i; 
    });
    return target;
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function distinctPriceHistory(array){
    var unique = {};
    var distinct = [];
    for( var i in array ){
        if( typeof(unique[array[i].date]) == "undefined"){
            distinct.push(array[i]);
        }
        unique[array[i].date] = 0;
    }
    return distinct;
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

