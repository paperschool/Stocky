/**
 * Created by Overlord on 20/08/2017.
 */


function StockyDataSet(datasetID,requestLine,preference){

    this.datasetID = datasetID;

    this.dataset = null;

    this.registeredObjects = [];

    this.registeredSimpleObjects = [];

    this.requestLine = requestLine;

    this.requestQueue = new StockyRequestQueue(this,2,200);

    this.preferenceKey = preference;

}

StockyDataSet.prototype.init = function () {

    this.dataset = null;

    this.appendRequest("GET",'');


    // var getrequest = API.GET(this.requestLine);
    //
    // getrequest.done((function(data){
    //     console.log(" > Fetching DataSet Data...");
    //     this.dataset = data;
    //     this.updateRegisteredObjects();
    //     print(data);
    // }).bind(this));
    //
    // getrequest.fail((function (xhr, status, error) {
    //     print("HTTP: GET - " + this.requestLine + " FAILED ");
    //     print("> " + JSON.stringify(xhr));
    //     print("> " + status);
    //     print("> " + error);
    // }).bind(this));

};


StockyDataSet.prototype.jsonToKeySet = function(data){
    if(typeof data === 'undefined') return;

    var keySet = [];

    for(var key in Stocky.getPreference(this.getPreferenceKey())){
        keySet.push(key);
    }
    keySet.push("ACTION");

    return keySet;

};

/**
 * This function takes a json object and converts it to a simple 2d array, this may be subject
 * to change as time goes on.
 * @param data - JSON data set object
 * @returns {Array} - simple 2D array object
 */
StockyDataSet.prototype.jsonToDataset = function(data){

    if(typeof data === 'undefined') return;

    var dataSet = [];

    for(var i = 0 ; i < data.length ; i++ ){

        var row = [];

        for(var key in data[i]){

            row.push(data[i][key]);

        }

        // action column for table interaction (general editing too)
        row.push(0);

        dataSet.push(row);

    }

    return dataSet;

};

StockyDataSet.prototype.refreshData = function (data) {
    // console.log(" > Fetching DataSet Data...");
    this.dataset = data;
    this.updateRegisteredObjects();
};

StockyDataSet.prototype.getPreferenceKey = function () {
    return this.preferenceKey;
};

StockyDataSet.prototype.getPreferences = function () {
    return Stocky.getPreference(this.preferenceKey);
};

StockyDataSet.prototype.registerComponent = function (object) {
    this.registeredObjects.push(object);

    object.associateDataSet(this);

    if(this.dataset !== null){
        object.refresh(this.jsonToKeySet(this.dataset),this.jsonToDataset(this.dataset));
    }
};

StockyDataSet.prototype.registerSimpleComponent = function (object,callback) {

    var simpleObject = {"component":object,"callback":callback};

    this.registeredSimpleObjects.push(simpleObject);

    if(this.dataset !== null){
        simpleObject['callback'](this.jsonToKeySet(this.dataset),this.jsonToDataset(this.dataset));
    }
};

StockyDataSet.prototype.updateRegisteredObjects = function () {

    for(var object = 0 ; object < this.registeredObjects.length ; object++){
        this.registeredObjects[object].refresh(this.jsonToKeySet(this.dataset),this.jsonToDataset(this.dataset));
    }

    for(var object = 0 ; object < this.registeredSimpleObjects.length ; object++){
        this.registeredSimpleObjects[object]['callback'](this.jsonToKeySet(this.dataset),this.jsonToDataset(this.dataset));
    }

};

StockyDataSet.prototype.appendRequest = function (type,payload,stringify) {

    var reqline = this.requestLine;

    if(type !== "POST" && type !== "GET"){
        reqline += "/" + payload[Object.keys(payload)[0]];
    }

    if(stringify){
        payload = JSON.stringify(payload);
    }

    this.requestQueue.append(reqline,type,payload);

};

StockyDataSet.prototype.fail = function (type,error) {
    print(" TYPE: '" + type + "' URI: " + this.requestLine + " Request Failed with: " + error + " - Try refreshing page!");
};