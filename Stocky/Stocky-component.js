/**
 * Created by Overlord on 11/08/2017.
 */

/**
 * This single object will be responsible for the entirety of the data life cycle, from http requesting the data
 * creating appropriate structures to display the data, validating and intercepting events on changing data and pushing
 * new requests back to the api server by building requests.
 * @param target - The static html element storing the visual output of the data
 * @param http   - The http request line that will be used for all request types http://api.example.com/data
 * @param activeColumns - The array of headers to be displayed TODO: outsource to json pref object
 * @param compType - Type name for which component to be added is.
 */
function StockyComponent(target,activeColumns,compType){

    this.componentTarget = target;

    this.componentType = compType;

    this.dataSetReference = null;

    this.activeColumns = activeColumns;

    this.componentObject = null;

    this.unsavedState = false;

    this.init();

}

// logically i have assumed that the initialiser should first attempt to get the data at the given
// request line, the get request returns an ajax object that we can bind success and failure behaviour
// to avoid the closure issue.
StockyComponent.prototype.init = function () {

    if(typeof this.componentType === 'undefined'){
        this.componentType = 'table';
    }

    switch(this.componentType){
        case 'table':
            this.componentObject = new StockyTable(this.componentTarget,this.activeColumns,this,false);
            break;
        case 'table-display':
            this.componentObject = new StockyTable(this.componentTarget,this.activeColumns,this,true);
            break;
        case 'selector':
            this.componentObject = new StockySelector(this.componentTarget,this.activeColumns);
            break;
        case 'single-dropdown':
            this.componentObject = new StockyDropdown(this.componentTarget,this.activeColumns,false);
            break;
        case 'multi-dropdown':
            this.componentObject = new StockyDropdown(this.componentTarget,this.activeColumns,true);
            break;
        case 'search-textbox':
            this.componentObject = new StockySearch(this.componentTarget,this.activeColumns);
        case 'search-unique':
            this.componentObject = new StockyUnique(this.componentTarget,this.activeColumns,this);
    }

};

StockyComponent.prototype.associateDataSet = function (datasetobject) {
    this.dataSetReference = datasetobject;
};

StockyComponent.prototype.getPreference = function () {
    return this.dataSetReference.getPreference();
};

StockyComponent.prototype.refresh = function (data) {

    switch(this.componentType){
        case 'table':
        case 'table-display':
            // this.componentObject.setHeaderData(header);
            this.componentObject.setBodyData(data);
            this.componentObject.init();

            Stocky.alert("info","Table: " + this.dataSetReference.getPreferenceKey(),"Table data fetched and inserted!",1000);
            break;

        case 'selector':
            this.componentObject.setBodyData(data);
            this.componentObject.init();
            break;
        case 'single-dropdown':
        case 'multi-dropdown':
            this.componentObject.setBodyData(data);
            this.componentObject.init();
            break;
        case 'search-textbox':
            this.componentObject.setBodyData(data);
            this.componentObject.init();
            break;
        case 'search-unique':
            this.componentObject.setBodyData(data);
            break
    }

};

StockyComponent.prototype.requestBuilder = function (type,data) {

    this.dataSetReference.appendRequest(type,data,true);

    // // in order to combat the issue of altering the original pref object stored in stocky, the returned object will be
    // // a copy of the json object rather then the original reference.
    // var requestPayload = Stocky.getPreference(this.dataSetReference.getPreferenceKey()), i = 0;
    //
    // for(var key in requestPayload){
    //     requestPayload[key] = Validation.Default(requestPayload[key],data[i],this.dataSetReference.getPreferenceKey() + " " + key);
    //     i++;
    // }
    //

};

StockyComponent.prototype.getSavedState = function () {
    return this.unsavedState;
};

StockyComponent.prototype.getData = function () {
  switch(this.componentType){
      case 'table':
          break;
      case 'table-display':
          break;
      case 'selector':
          return this.componentObject.getSelectedData();
          break;
      case 'single-dropdown':
      case 'multi-dropdown':
          return this.componentObject.getSelectedData();
          break;
      case 'search-textbox':
          return this.componentObject.getSearch();
          break;
      case 'search-unique':
          // accessor for such a simple component seems unnecessary
          return this.componentObject.inputCurrent;
          break;
  }
};

