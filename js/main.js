
$(document).ready(function(){

    console.log("Running Initial Setup...");

    var prefFilePath = '/json/api_pref.json';
    var apiMainURI   = 'https://api.eposnowhq.com/api/';
    var apiVersion   = 'global/';

    // set up stocky module with path to preferences file and uri generic path
    Stocky.init(prefFilePath,apiMainURI + apiVersion,null);

    // registering a new dataset by passing in the dataset string id, the uri end point (which will be concatenated with
    // the build in URI defined in init() and the id for the preference associated with the data set in the json file.
    // the function will create a new dataset object with these params and then return it for later use.
    Stocky.registerDataSet('BrandDataSet',   'Brand',       'BRAND',{});
    Stocky.registerDataSet('ColourDataSet',  'Colour',      'COLOUR',{});
    Stocky.registerDataSet('CategoryDataSet','Category',    'CATEGORY',{});
    Stocky.registerDataSet('LocationDataSet','Location',    'LOCATION',{});
    Stocky.registerDataSet('ProductDataSet', 'Product',     'PRODUCT',{});
    Stocky.registerDataSet('StockDataSet',   'ProductStock','PRODUCT',{});
    // // Stocky.registerDataSet('StyleCategoryDataSet','Category','CATEGORY',{"filter":{"key":"ParentID","value":"null"}});

    // // Instantiating the Preset Editor Tables
    Stocky.registerComponent('BrandDataSet',new StockyComponent($('#brandEditorTable'),['Name'],'table'));
    Stocky.registerComponent('ColourDataSet',new StockyComponent($('#colourEditorTable'),['Name'],'table'));
    Stocky.registerComponent('CategoryDataSet',new StockyComponent($('#categoryEditorTable'),['Name','ShowOnTill','Wet'],'table'));

    // Stocky.registerComponent('ColourDataSet',new StockyComponent($('#brandAccordion_1'),['Id','Name'],'multi-dropdown'));


    // // Instantiating the Product Matrix Editor
    var productMatrix = Stocky.registerComponent('ProductDataSet',new StockyMultiPlexor($('#productBuilderBody')));
    productMatrix.registerObject('Product Style','single-dropdown','CategoryDataSet',["id","Name"],'CategoryId');
    productMatrix.registerObject('Product Brand','single-dropdown','BrandDataSet',["id","Name"],'BrandId');
    productMatrix.registerObject('Product Colours','multi-dropdown','ColourDataSet',["id","Name"],'ColourId');
    productMatrix.registerControl('Product Size-Range','scan-textbox','SIZE','Size');
    productMatrix.registerControl('Product Cost Price','textbox','PRICE','CostPrice');
    productMatrix.registerControl('Product Sale Price','textbox','PRICE','SalePrice');


    //////////////////////////////////////////////
    // DEFUNCT CODE //////////////////////////////
    //////////////////////////////////////////////

    // productMatrix.registerObject('Product Style','search-unique','CategoryDataSet',[0,1],'CategoryID');
    // Registering all controls and components to build product matrix form.
    // productMatrix.registerControl('Product Name','textbox','STRING','Name');
    // productMatrix.registerObject('Product Location','single-dropdown',LocationDataSet,[0,2],'LocationID');
    // productMatrix.registerObject('Product Style','search-textbox','ColourDataSet',[0,2],'BrandID');
    // productMatrix.registerObject('Product Category','single-dropdown','CategoryDataSet',[0,1],'CategoryID');


    // createDebugButtons();

});

/**
 * TODO: Add Validation Checking
 * @param parent
 * @param dataset
 * @param table
 * @constructor
 */
function StockyMultiPlexor(parent){

    this.matrixParent = parent;

    this.matrixDataSetReference = null;

    this.matrixOutputTable = new StockyComponent($('#productBuilderResultBody'),["Name","SalePrice","Size","ColourId"],'table-display');

    this.matrix = $('<div></div>').appendTo(this.matrixParent);

    this.matrixSave = $('<button type="button" class="btn btn-success">Add!</button>').appendTo(this.matrixParent);

    this.matrixSave.click((function () {
        this.collateData();
    }).bind(this));

    this.matrixSave.click((function(){

    }).bind(this));

    this.matrixComponents = {};

}

StockyMultiPlexor.prototype.newFormGroup = function (label) {

    var formGroup = $('<div class="form-group row"><label class="col-3 col-form-label">'+label+'</label></div>').appendTo(this.matrix);
    return $('<div class="col"></div>').appendTo(formGroup);

};

StockyMultiPlexor.prototype.registerObject = function (label,type,dataset,activeheader,idKey) {

    var component = {"type":"","hasID":false,"hasMultiple":false,"compObject":null};

    component["type"]    = type;
    component["hasID"]   = true;
    component["idKey"]   = idKey;
    component["isStyle"] = false;


    switch(type){

        case 'search-unique' :
            component["hasMultiple"] = false;
            component["compObject"]  = new StockyComponent(this.newFormGroup(label),activeheader,type);
            break;

        case 'single-dropdown' :
        case 'search-textbox' :
            component["hasMultiple"] = false;
            component["compObject"]  = new StockyComponent(this.newFormGroup(label),activeheader,type);
            break;

        case 'multi-dropdown'  :
            component["hasMultiple"] = true;
            component["compObject"]  = new StockyComponent(this.newFormGroup(label),activeheader,type);
            break;
        case 'selector'        : break;
        default : return;
    }

    Stocky.registerComponent(dataset,component["compObject"]);

    this.matrixComponents[idKey] = component;
};

StockyMultiPlexor.prototype.registerControl = function (label,type,datatype,idKey) {

    var component = {"type":"","hasID":false,"hasMultiple":false,"compObject":null};

    component["idKey"]   = idKey;
    component["type"]    = type;
    component["hasID"]   = false;
    component["isStyle"] = false;


    switch(type){
        case 'textbox' :
            component["hasMultiple"] = false;
            component["compObject"]  =  new StockyTextBox(this.newFormGroup(label),type,'',null,datatype);
            break;

        case 'scan-textbox'  :
            component["hasMultiple"] = true;
            component["compObject"]  = new StockyScanTextBox(this.newFormGroup(label),'scan-texbox','',datatype,null);
            break;
    }

    this.matrixComponents[idKey] = component;

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
    for(var component in this.matrixComponents){

        var comp = this.matrixComponents[component];

        var compData = comp["compObject"].getData();

        if( compData.constructor === Array && compData.length === 0){
            console.error(" > Product Matrix Error : Failed Empty Field On " + comp['productHeaderName']);
            return false;
        } else if(!Validation.Type("NULL",compData)){
            console.error(" > Product Matrix Error : Failed Empty Field On " + comp['productHeaderName']);
            return false;
        }

        var compDataObj = {"header":comp["idKey"],"data":null};
        var compDataUsed = [];

        // if control holds data which has both an associated ID and is multiple choice
        if(comp["hasID"] && comp["hasMultiple"]){
            for(var row = 0 ; row < compData.length ; row++){
                var item = {};
                item[comp["idKey"]] = compData[row]["Id"];
                compDataUsed.push(item);
            }
        }

        // if control holds data which has no associated ID but is multiple choice
        else if(!comp["hasID"] && comp["hasMultiple"]){

            for(var row = 0 ; row < compData.length ; row++){
                var item = {};
                item[comp["idKey"]] = compData[row];
                compDataUsed.push(item);
            }
        }

        // if control holds data which has an associated ID but is not multiple choice
        else if(comp["hasID"] && !comp["hasMultiple"]){
            // store data in array for simpler parsing later, only fetching the zero index as we only want the ID
            var item = {};

            // very janky code to set Name of product as category name
            if(comp["idKey"] === "CategoryId"){
                FetchedData.push({"header":"Name","data":[{"Name":compData[0]["Name"]}]});
            }


            item[comp["idKey"]] = compData[0]["Id"];
            compDataUsed.push(item);
        }

        // if control holds data which has neither an associated ID or is multiple choice
        else if(!comp["hasID"] && !comp["hasMultiple"]){
            var item = {};
            item[comp["idKey"]] = compData;
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

    // get preferences file for validation
    var productPref = Stocky.getPreference("PRODUCT");


    // var productsString = [];
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



        console.log(product);

        // productsString.push(JSON.stringify(product));
        //

        products.push(product);
    }

    this.matrixDataSetReference.appendRequest("POST",products,true);

    // console.log(products);

    // console.table(products);

    this.matrixOutputTable.refresh(this.jsonToDataset(products));

};

StockyMultiPlexor.prototype.StockRequestBuilder = function () {



};

StockyMultiPlexor.prototype.associateDataSet = function (reference) {
    this.matrixDataSetReference = reference;
    this.matrixOutputTable.dataSetReference = reference;
};

StockyMultiPlexor.prototype.refresh = function (header,body) {
    this.matrixOutputTable.refresh(header,body);
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
