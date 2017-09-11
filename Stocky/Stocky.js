/**
 * @namespace Stocky
 */

/**
 * Main Constructor For the stocky library, which /currently/ stores the registered components in an array. the purpose
 * for this is because the preferences file is asynchronously fetched this allows components to construct but not attempt
 * any qpi requests until the pref file is returned (contains the api key). The other variable stores the returned preference
 * file.
 * @constructor
 */
var Stocky = (function() {

    var registeredDataSets = [];

    var registeredComponents = [];

    var preferences = null;

    var requestReady = false;

    var $alert = null;

    function init(path){

        loadJSON(function(response){
            console.log(" > Fetching App Settings...");
            Stocky.preferences = response;
            Authentication.defineAccessToken(Stocky.preferences['Authentication']['Key']);
            setRequestReady(true);
            Stocky.initDataSets();
        },path);

    }

    function setRequestReady(state){
        requestReady = state;
    }

    function getRequestReady(){
        return requestReady;
    }

    function alert(type,header,body,lifespan){

        switch (type){
            case 'success' : $alert = $('<div id="screen-notification" class="alert alert-success" role="alert"><strong>'+header+' :</strong> '+body+'</div>'); break;
            case 'info'    : $alert = $('<div id="screen-notification" class="alert alert-info" role="alert"><strong>'+header+' :</strong> '+body+'</div>'); break;
            case 'warning' : $alert = $('<div id="screen-notification" class="alert alert-warning" role="alert"><strong>'+header+' :</strong> '+body+'</div>'); break;
            case 'error'   : $alert = $('<div id="screen-notification" class="alert alert-danger" role="alert"><strong>'+header+' :</strong> '+body+'</div>'); break;
            default : $alert = $('<div class="col-4 alert alert-info" role="alert"><strong>'+header+' :</strong> '+body+'</div>'); break;
        }

        $("#alert-chain").prepend($alert);

        $alert.fadeTo(lifespan, 500).slideUp(500, function(){
            $alert.slideUp(500);
            $alert.remove();
            $("#alert-chain").empty();
            // console.log(Stocky.$alert);
        });
    }

    function getComponent(index){
        return typeof preferences[index] !== 'undefined' ? preferences[index] : null;
    }

    function getPreference(key){
        return typeof Stocky.preferences[key] !== 'undefined' ? JSON.parse(JSON.stringify(Stocky.preferences[key])) : null;
    }


    function registerDataSet(datasetObject){

        registeredDataSets.push({"name":datasetObject.datasetID,"object":datasetObject});

        if(getRequestReady()){
            registeredDataSets[registeredDataSets.length - 1]['object'].init();
        }
    }

    function initDataSets(){
        for(var i = 0 ; i < registeredDataSets.length ; i++){
            registeredDataSets[i]['object'].init();
        }
    }

    var unsavedStatus = false;

    function setSavedStatus(state){
        unsavedStatus = state;
    }

    function checkUnsaved(){

        var warnMessage = "Edits Made To: \n", changed = false;

        for(var components = 0 ; components < registeredComponents.length ; components++){
            if(registeredComponents[components].getSavedState()){
                changed = true;
                warnMessage += registeredComponents[components].componentTarget + '\n';
            }
        }

        if(changed)
            Stocky.alert('error','Unsaved Changed',Stocky.checkUnsaved(),3000);

        return '';
    }

    return {
        setSavedStatus : setSavedStatus,
        checkUnsaved : checkUnsaved,
        alert : alert,
        registerDataSet : registerDataSet,
        initDataSets : initDataSets,
        init : init,
        getRequestReady : getRequestReady,
        getPreference : getPreference,
        preferences : preferences,
        $alert : $alert
    }


})();

var Validation = (function(){

    function Type(type,content){

        var success = false;

        switch(type){
            case "NULL" :

                success = true;

                if(content === null || content === undefined){
                    success = false
                } else{
                    if(content.constructor === Array){
                        if(content.length === 0){
                            success = false
                        }
                    } else {
                        if ( content === "" || /\s/g.test(content)) {
                            success = false;
                        }
                    }
                }

                break;
            case "WHITESPACE" :
                if( content === "" ||
                    content === " " ||
                    content === null ||
                    content === undefined ||
                    /[^a-z0-9\s]/gi.test(content)){

                    success = false;
                } else {
                    success = true;
                }
                break;
            case "SINGLESTRING" :

                if( content === "" ||
                    content === " " ||
                    content === null ||
                    content === undefined ||
                    /\s/g.test(content) ||
                    /[^a-z0-9]/gi.test(content)){

                    success = false;
                } else {
                    success = true;
                }

                break;

            case "STRING":
                if( content === "" ||
                    content === " " ||
                    content === null ||
                    content === undefined ||
                    /[^a-z0-9\s]/gi.test(content)) {
                    success = false;
                } else {
                    success = true;
                }
                // typeof content === "string" ? success = true : success = false;
                break;

            case "PRICE":
                if( content === "" ||
                    content === " " ||
                    content === null ||
                    content === undefined ||
                    !(/^(?!0\.00)\d{1,3}(,\d{3})*(\.\d\d)?$/gm.test(content))) {
                    success = false;
                } else {
                    success = true;
                }
                // typeof content === "string" ? success = true : success = false;
                break;
            case "SIZE":
                if( content === "" ||
                    content === " " ||
                    content === null ||
                    content === undefined ||
                    /[^a-z0-9.\s]/gi.test(content)) {
                    success = false;
                } else {
                    success = true;
                }
                // typeof content === "string" ? success = true : success = false;
                break;
            case "BOOL":

                if(content === ""){ success = false; break; }

                typeof content === "boolean" ? success = true : success = false;

                break;
            case "INT":

                if(!Validation.Type("NULL",content)){ success = false; break; }

                typeof /^\[0-9]+$/.test(content) ? success = true : success = false;

                break;

            case "ID":
                if(!Validation.Type("NULL",content)){ success = false; break; }

                typeof /^\[0-9]+$/.test(content) ? success = true : success = false;

                break;

            default : print("Validation Type - Not defined error"); success = false; break;
        }
        return success;
    }

    function Default(type,content,defaultContent){

        var returnData = null;

        switch(type){
            case "STRING":
                if(Validation.Type(type,content)){
                    returnData = content;
                } else {
                    returnData = "Default " + defaultContent;
                }
                break;
            case "INT":
                if(Validation.Type(type,content)){
                    returnData = content;
                } else {
                    returnData = 0;
                }
                break;
            case "DEC":
                if(Validation.Type("INT",content)){
                    returnData = content;
                } else {
                    returnData = 1;
                }
                break;
            case "BOOL":
                if(Validation.Type(type,content)){
                    returnData = content;
                } else {
                    returnData = true;
                }
                break;
            case "ID":
                if(Validation.Type(type,content)){
                    returnData = content;
                } else {
                    returnData = 0; // this number is irrelevant, it gets replaced by the api
                }
                break;
            case "PRICE":
                if(Validation.Type(type,content)){
                    returnData = content;
                } else {
                    returnData = 0.00;
                }
                break;
            case "SIZE":
                if(Validation.Type(type,content)){
                    returnData = content;
                } else {
                    returnData = 0;
                }
                break;
            case "NULLID":
                if(Validation.Type('ID',content)){
                    returnData = content;
                } else {
                    returnData = null; // this number is irrelevant, it gets replaced by the api
                }
                break;
            default : print("Validation Type - Not defined error"); break;
        }
        return returnData;
    }


    return {
        Default:Default,
        Type:Type

    }


})();

/**
 * Authentication Module - To set the authentication token for api interaction with EPOSNOW
 */
var Authentication = (function(){

    var currentToken = "";

    function defineAccessToken(token){
        currentToken = token;
    }

    function getAccessToken(){ return currentToken; }

    function getAccessHeader(){ return {"Authorization":"Basic "+ this.getAccessToken()}}

    return {
        defineAccessToken : defineAccessToken,
        getAccessToken : getAccessToken,
        getAccessHeader : getAccessHeader
    }
})();

/**
 * API Module - This is responsible for making all api requests to the EPOS server
 * @type {{GET}} - PUBLIC Get Method takes a url argument and makes an asynchronous get request to the
 * supplied url
 */
var API = (function(){

    function request(newRequest){

        var request = {
            url: newRequest['url'],
            type: newRequest['type'],
            data: newRequest['payload'],
            contentType: "text/plain",
            accepts: "text/plain",
            useDefaultXhrHeader: false,
            // dataType: 'json',
            crossDomain: true,
            async: true,
            beforeSend: function (request) {

                request.setRequestHeader("Authorization", "Basic " + Authentication.getAccessToken());
            }
        };
        return($.ajax(request));

    }

    function packPair(key,value){
        return '"'+key+'": "'+value+'"';
    }
    // get request function passing the url into the function, this method will attempt a get request function.
    function GET(URL){

        var request = {
            url: URL,
            type: "GET",
            async: true,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + Authentication.getAccessToken());
            }
        };
        return($.ajax(request));
    }
    function POST(URL,payload,callback) {

        var request = {
            url: URL,
            type: "POST",
            contentType: "text/plain",
            accepts: "text/plain",
            dataType: 'json',
            data: payload,
            crossDomain: true,
            async: true,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Basic " + Authentication.getAccessToken());
            },
            error: function (jqXHR) {
                console.log("Error code: " + jqXHR.status);
                console.log(jqXHR.responseText);
                throw "Error when sending request to EposNow API, Error Code:" + jqXHR.status + ", Error Message:" + jqXHR.responseText;
            },
            success: function (data){
                callback(data);
            }
        };
        return($.ajax(request));
    }
    return {
        request : request,
        packPair : packPair,
        GET : GET,
        POST : POST
    }

})();


/**
 * App Settings module - For saving or restoring app settings on page load.
 */
var Appsettings = (function(){

    var appSettings = null;

    function getAppSettings() {

        if(isNaN(appSettings))
            loadAppSettings();

        return appSettings;
    }

    function saveAppSettings(){
        // EposnowAPI.appSettings.save(appSettings);
    }

    function fetchAppSettings(){

        // API.GET("https://api.eposnowhq.com/api/V2/Brand");
        // API.GET("https://api.eposnowhq.com/api/V2/Product")
        // API.GET("content/c_9/test.json");

    }

    function loadAppSettings(){

        if(isNaN(EposnowAPI.appSettings.load()))
            loadAppSettings();


    }

    function addAppSettingProperty(key,value){
        switch(key){
            case 10: break;
        }
    }

    return {
        fetchAppSettings : fetchAppSettings,
        saveAppSettings : saveAppSettings,
        loadAppSettings : loadAppSettings,
        getAppSettings  : getAppSettings
    }

})();

function loadJSON(callback,path) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {

        if (xobj.readyState === 4 && xobj.status === 200) {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback( JSON.parse(xobj.responseText));
        }
    };
    xobj.send(null);

};

function print(message){
    console.log(message);
}

/**
 * A function to concatenate multiple identifiers into a single id for display in source code
 * TODO: Replace multiple input variables with array that can be iterated across
 * @param prefix -
 * @param suf1
 * @param suf2
 * @returns {*} - Return String
 */
function idcon(prefix,suf1,suf2){

    var seperator = '-';

    if(typeof prefix === 'undefined'){ prefix = ''; }

    if(typeof suf1   === 'undefined'){ suf1 = ''; }
    else { suf1 = seperator + suf1; }

    if(typeof suf2   === 'undefined'){ suf2 = ''; }
    else { suf2 = seperator + suf2; }


    return prefix+suf1+suf2;
}

$(window).on('beforeunload',Stocky.checkUnsaved());
