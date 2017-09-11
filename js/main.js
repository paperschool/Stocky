$(document).ready(function(){

    console.log("Running Initial Setup...");

    Stocky.init('/Stocky/json/api_pref.json');

    var BrandDataSet = new StockyDataSet('BrandDataSet','https://api.eposnowhq.com/api/v2/Brand','BRAND');
    Stocky.registerDataSet(BrandDataSet);

    var ColourDataSet = new StockyDataSet('ColourDataSet','https://api.eposnowhq.com/api/v2/Colour','COLOUR');
    Stocky.registerDataSet(ColourDataSet);

    var CategoryDataSet = new StockyDataSet('CategoryDataSet','https://api.eposnowhq.com/api/v2/Category','CATEGORY');
    Stocky.registerDataSet(CategoryDataSet);

    var LocationDataSet = new StockyDataSet('LocationDataSet','https://api.eposnowhq.com/api/v2/Location','LOCATION');
    Stocky.registerDataSet(LocationDataSet);

    var ProductDataSet = new StockyDataSet('ProductDataSet','https://api.eposnowhq.com/api/v2/Product','PRODUCT');
    Stocky.registerDataSet(ProductDataSet);

    var StockDataSet = new StockyDataSet('StockDataSet','https://api.eposnowhq.com/api/v2/ProductStock','PRODUCT');
    Stocky.registerDataSet(StockDataSet);


    // Instantiating the Preset Editor Tables
    BrandDataSet.registerComponent(new StockyComponent($('#brandEditorTable'),null,[1],'table'));

    ColourDataSet.registerComponent(new StockyComponent($('#colourEditorTable'),null,[2],'table'));

    CategoryDataSet.registerComponent(new StockyComponent($('#categoryEditorTable'),null,[1,4],'table'));

    var ProductMatrixOutput = new StockyComponent($('#productBuilderResultBody'),null,[0,1,4],'table-display');

    // var productMatrixOutput = new StockyComponent($('#productBuilderResultBody'),null,[1,3,6,10,16,18],'table-display');
    ProductDataSet.registerComponent(ProductMatrixOutput);

    // Instantiating the Product Matrix Object
    var productMatrix = new StockyMultiPlexor($('#productBuilderBody'),ProductDataSet,ProductMatrixOutput);

    // Registering all controls and components to build product matrix form.
    productMatrix.registerControl('Product Name','textbox','STRING','Name');

    // productMatrix.registerObject('Product Location','single-dropdown',LocationDataSet,[0,2],'LocationID');
    productMatrix.registerObject('Product Brand','single-dropdown',BrandDataSet,[0,1],'BrandID');
    productMatrix.registerObject('Product Colours','multi-dropdown',ColourDataSet,[0,2],'ColourID');
    productMatrix.registerObject('Product Category','single-dropdown',CategoryDataSet,[0,1],'CategoryID');

    productMatrix.registerControl('Product Size-Range','scan-textbox','SIZE','Size');
    productMatrix.registerControl('Product Cost Price','textbox','PRICE','CostPrice');
    productMatrix.registerControl('Product Sale Price','textbox','PRICE','SalePrice');


    createDebugButtons(BrandDataSet,ColourDataSet,CategoryDataSet,LocationDataSet,ProductDataSet,StockDataSet);



});

/**
 * TODO: Add Validation Checking
 * @param parent
 * @param dataset
 * @param table
 * @constructor
 */
function StockyMultiPlexor(parent,dataset,table){

    this.matrixParent = parent;

    this.matrixDataSetReference = dataset;

    this.matrixOutputTable = table;

    this.matrix = $('<div></div>').appendTo(this.matrixParent);

    this.matrixSave = $('<button type="button" class="btn btn-success">Add!</button>').appendTo(this.matrixParent);

    this.matrixSave.click((function () {
        this.collateData();
    }).bind(this));

    this.matrixSave.click((function(){

    }).bind(this));

    this.matrixComponents = [];

}

StockyMultiPlexor.prototype.newFormGroup = function (label) {

    var formGroup = $('<div class="form-group row"><label class="col-3 col-form-label">'+label+'</label></div>').appendTo(this.matrix);
    return $('<div class="col"></div>').appendTo(formGroup);

};

StockyMultiPlexor.prototype.registerObject = function (label,type,dataset,activeheader,productHeaderName) {

    var component = {"type":"","hasID":false,"hasMultiple":false,"compObject":null};

    switch(type){
        case 'single-dropdown' :

            component["type"]        = type;
            component["hasID"]       = true;
            component["hasMultiple"] = false;
            component["productHeaderName"] = productHeaderName;
            component["compObject"]  = new StockyComponent(this.newFormGroup(label),null,activeheader,type);

            dataset.registerComponent(component["compObject"]);
            break;

        case 'multi-dropdown'  :

            component["type"]        = type;
            component["hasID"]       = true;
            component["hasMultiple"] = true;
            component["productHeaderName"] = productHeaderName;
            component["compObject"]  = new StockyComponent(this.newFormGroup(label),null,activeheader,type);

            dataset.registerComponent(component["compObject"]);
            break;

        case 'selector'        : break;
    }

    this.matrixComponents.push(component);
};

StockyMultiPlexor.prototype.registerControl = function (label,type,datatype,productHeaderName) {

    var component = {"type":"","hasID":false,"hasMultiple":false,"compObject":null};

    switch(type){
        case 'textbox' :

            component["type"]        = type;
            component["hasID"]       = false;
            component["hasMultiple"] = false;
            component["productHeaderName"] = productHeaderName;
            component["compObject"]  =  new StockyTextBox(this.newFormGroup(label),type,'',null,datatype);

            break;

        case 'scan-textbox'  :

            component["type"]        = type;
            component["hasID"]       = false;
            component["hasMultiple"] = true;
            component["productHeaderName"] = productHeaderName;
            component["compObject"]  = new StockyScanTextBox(this.newFormGroup(label),'scan-texbox','',datatype,null);

            break;
    }

    this.matrixComponents.push(component);

};

StockyMultiPlexor.prototype.collateData = function () {

    var fetchData = this.AccumulateData();

    if(fetchData === false){
        console.error(" > Validation Failed - Fix Matrix Data Errors..");
    } else {
        this.RequestBuilder(this.EnumerateProducts(fetchData));
    }

};

StockyMultiPlexor.prototype.AccumulateData = function () {

    // empty array containing isolated request data;
    var FetchedData = [];

    // loop through all registered data editors
    for(var component = 0 ; component < this.matrixComponents.length ; component++){

        var comp = this.matrixComponents[component];

        var compData = comp["compObject"].getData();

        if( compData.constructor === Array && compData.length === 0){
            console.error(" > Product Matrix Error : Failed Empty Field On " + comp['productHeaderName']);
            return false;
        } else if(!Validation.Type("NULL",compData)){
            console.error(" > Product Matrix Error : Failed Empty Field On " + comp['productHeaderName']);
            return false;
        }

        var compDataObj = {"header":comp["productHeaderName"],"data":null};
        var compDataUsed = [];

        // if control holds data which has both an associated ID and is multiple choice
        if(comp["hasID"] && comp["hasMultiple"]){
            for(var row = 0 ; row < compData.length ; row++){
                var item = {};
                item[comp["productHeaderName"]] = compData[row][0];
                compDataUsed.push(item);
            }
        }

        // if control holds data which has no associated ID but is multiple choice
        else if(!comp["hasID"] && comp["hasMultiple"]){

            for(var row = 0 ; row < compData.length ; row++){
                var item = {};
                item[comp["productHeaderName"]] = compData[row];
                compDataUsed.push(item);
            }
        }

        // if control holds data which has an associated ID but is not multiple choice
        else if(comp["hasID"] && !comp["hasMultiple"]){
            // store data in array for simpler parsing later, only fetching the zero index as we only want the ID
            var item = {};
            item[comp["productHeaderName"]] = compData[0][0];
            compDataUsed.push(item);
        }

        // if control holds data which has neither an associated ID or is multiple choice
        else if(!comp["hasID"] && !comp["hasMultiple"]){
            var item = {};
            item[comp["productHeaderName"]] = compData;
            compDataUsed.push(item);

        }
        else {
            console.error(" > Matrix Error : Component Flags Poorly Configured...");
        }

        compDataObj["data"] = compDataUsed;
        FetchedData.push(compDataObj);

    }

    return FetchedData;

};

StockyMultiPlexor.prototype.EnumerateProducts = function (data) {

    var matrix = [];

    for(var row = 0 ; row < data.length ; row++){
        matrix = kproduct(matrix,data[row]["data"]);
    }

    // this function will concatenate two seperate arrays in a cross product fashion;
    function kproduct(a,b){

        var ac = 0, bc = 0, al = a.length, bl = b.length, abl = al*bl, abc = 0, ab = [];

        if(al === 0 && b === 0){
            return [];
        }
        if(al === 0){
            return b;
        }
        if(bl === 0){
            return a;
        }

        for(abc ; abc < abl ; abc++){
            if(bc >= bl){
                bc = 0;
                ac++;
            }

            ab.push($.extend(true, {},a[ac], b[bc]));
            bc++;
        }

        return ab;
    }

    return matrix;
};

StockyMultiPlexor.prototype.RequestBuilder = function (data) {

    var productPref = Stocky.getPreference("PRODUCT");

    var productsString = [];
    var products = [];

    for(var dataRow = 0 ; dataRow < data.length ; dataRow++){

        var product = {};

        for(var key in productPref){
            if(data[dataRow].hasOwnProperty(key)){
                product[key] = Validation.Default(productPref[key],data[dataRow][key]);
            } else {
                product[key] = Validation.Default(productPref[key],null);
            }

        }

        this.matrixDataSetReference.appendRequest("POST",product,true);
        this.matrixDataSetReference.appendRequest("POST",product,true);

        productsString.push(JSON.stringify(product));
        products.push(product);
    }

    console.log(products);

    this.matrixOutputTable.refresh(this.jsonToKeySet(products),this.jsonToDataset(products));

};

StockyMultiPlexor.prototype.StockRequestBuilder = function () {



};

StockyMultiPlexor.prototype.jsonToKeySet = function(data){
    if(typeof data === 'undefined') return;

    var keySet = [];

    for(var key in Stocky.getPreference("PRODUCT")){
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
StockyMultiPlexor.prototype.jsonToDataset = function(data){

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

function jsonStrEncap(a,b){

    a = '"'+a+'"';
    b = '"'+b+'"';

    return a + ':' + b;

}


