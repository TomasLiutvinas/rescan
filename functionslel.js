module.exports = {
    GetToday: function(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd
        } 

        if(mm<10) {
            mm='0'+mm
        } 

        return today = mm+'/'+dd+'/'+yyyy;
    },
    DoUrlRequest: function(url, collectData, processData, extraData){
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                if(this.responseText){
                    //console.log('Response: Success');
                    if(this.responseText){
                        collectData(this.responseText, processData, extraData);
                    } else {
                        console.log('Response: null');
                    }
                }
            }
        };
        xhr.open("GET", url);
        xhr.send();
    },

}