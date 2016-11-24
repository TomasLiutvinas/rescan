console.log('butai son');

function processShit(htmlResponse){
    if(htmlResponse){
        console.log('Response: found');        
        console.log(htmlResponse.toString());
    }else{
        console.log('Response: empty');
    }
console.log('Response: END');
};

var url = 'http://www.aruodas.lt/butai/visi-miestai/?obj=1&mod=Siulo&act=makeSearch&Page=1'


var sys = require('util');
var jquery = require('jquery');
var jsdom = require("jsdom");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
    // console.log("State: " + this.readyState);
    
    if (this.readyState === 4) {
        if(this.responseText){
            console.log('Response: Success');
            var response = this.responseText;
            jsdom.env(
              this.responseText,
              ["http://code.jquery.com/jquery.js"],
              function (err, window) {
                var $ = window.$;
                //console.log(window.$("div").length);
                var pages = parseInt($($('a.page-bt')[$('a.page-bt').length-2]).text());
                console.log(pages);

                var rows = $('table.list-search .list-row');
                var flats = [];

                for(var i = 0; i < rows.length; i++){
                    flat = {};
                    flat.imageUrl = $(rows[i]).find('div.list-photo img').attr('src');
                    flat.address = $(rows[i]).find('td.list-adress  a').text();
                    flat.rooms = parseInt($($(rows[i]).find('td')[2]).text());
                    flat.area = parseInt($($(rows[i]).find('td')[3]).text());
                    flat.floor = $($(rows[i]).find('td')[4]).text();
                    flat.priceHistory = [];
                    var price = $(rows[i]).find('td span.list-item-price').text().match(/\d/g);
                    var priceHistory = {
                        date: getToday(),
                        price: price ? price.join("") : null,
                        url: $(rows[i]).find('td.list-adress a').attr('href')
                    }
                    flat.priceHistory.push(priceHistory);
                    flats.push(flat);
                    console.log(flat);    
                }
              }
            );
        }
    }


};

xhr.open("GET", url);
xhr.send();

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

function getToday(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 

    return today = mm+'/'+dd+'/'+yyyy;
}