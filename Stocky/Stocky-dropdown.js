/**
 * Created by Overlord on 20/08/2017.
 */


/**
 * Constructor method for Stocky Drop Down Object
 * @param parent            - Parent Html Div
 * @param keyValAssociation - Array containing the id index and the value index desired for display
 * @param stackable         - Bool to determine if the dropdown should allow multiple selections.
 * @constructor
 */
function StockyDropdown(parent,keyValAssociation,stackable){

    // boolean that determines if multiple options can be selected
    this.stackable = stackable;

    // div parent
    this.dropdownParent = parent;

    // dropdown div object
    this.dropdown       = $('<div class="dropdown" id="dropdown_'+this.dropdownParent +'"></div>').appendTo(this.dropdownParent);

    // button html for dropdown object
    this.dropdownHead   = $('<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdown_button_'+this.dropdownParent +'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Select Items</button>').appendTo(this.dropdown);

    // html for selectable elements from dropdown
    this.dropdownBody   = $('<div id="dropdown_body'+this.dropdownParent +'" class="dropdown-menu" aria-labelledby="dropdownMenuButton"></div>').appendTo(this.dropdown);

    // bodydata structure
    this.bodyData = null;

    // object to hold all dropdown object variables
    this.options = [];

    // Array containing the id index and the value index desired for display
    this.keyValAssociation = keyValAssociation;

    // array of objects that have been selected
    this.selectedOptions = [];

    // tool tip render method
    this.addToolTip();

}

// TODO: Updating dropdown mustn't effect displayed selected options array or text

// initialiser method for dropdown object
StockyDropdown.prototype.init = function(){
    // emptying selected object array
    this.selectedOptions = [];
    // emptying div with selectable options div
    this.dropdownBody.empty();
    // emptying option object array
    this.options = [];
    // add all  selectable elements
    this.addElements();
    // set dropdown button inner text
    this.displaySelected();
};

// variable to reset all dropdown objects
StockyDropdown.prototype.clearSelections = function () {

    // empty selected options array
    this.selectedOptions = [];

    // iterate over options array
    for(var option = 0 ; option < this.options.length ; option++){
        // set all selected options to not selected
        if(this.options[option].selected)
            this.options[option].toggleOption();
    }

    // display currently selected elements on button inner text
    this.displaySelected();

};

// on option selected run this method
StockyDropdown.prototype.handleSelection = function (index) {
    // checking if dropdown is multi dropdown or not
    if(this.stackable){
        // run method to combind selected elements
        this.combineSelected(index);
    } else {
        // run method to swap selected elements
        this.swapSelected(index);
    }
};

// method that runs when a single dropdown option is selected
StockyDropdown.prototype.swapSelected = function (index) {

    // checking if active option has simply been de-selected
    if(this.bodyData[index] === this.selectedOptions[0]){
        this.clearSelections();
        return;
    }

    // iterating across options to both discard old selections and select new option
    for(var option = 0 ; option < this.options.length ; option++){
        // check if this option is both selected and not equal to the current index
        if(this.options[option].selected && this.options[option].optionIndex !== index){
            // toggle the option on
            this.options[option].toggleOption();
        }
        // check if this option index === the selected index
        if(this.options[option].optionIndex === index){
            // set the first element of the selected options  to that same row of the body data.
            this.selectedOptions[0] = this.bodyData[option];
        }
    }

    // update button inner text
    this.displaySelected();

};

// method that runs when a multi dropdown option is selected
StockyDropdown.prototype.combineSelected = function (index) {

    // empty selected options array
    this.selectedOptions = [];

    // iterate over options array and push every option with a selected flag active
    for(var option = 0 ; option < this.options.length ; option++){
        if(this.options[option].selected){
            this.selectedOptions.push(this.bodyData[option]);
        }
    }

    this.displaySelected();

};

// method that modifies the inner text of the dropdown button
StockyDropdown.prototype.displaySelected = function () {

    // reset button string
    var buttonText = '';

    // iterate over selected options array
    for(var selected = 0 ; selected < this.selectedOptions.length ; selected++){
        // append string display name of selected option + comma to imply next element.
        buttonText += this.selectedOptions[selected][this.keyValAssociation[1]].toString() + (this.stackable ? ', ' : '');
    }

    // if button text is null return default string output
    if(buttonText === ''){
        buttonText = 'Select Items';
    }

    // update inner html
    this.dropdownHead.html(buttonText);

};

// method that sets body data of dropdown
StockyDropdown.prototype.setBodyData = function(data){
    this.bodyData = data;
};

// method to render out all potential dropdown elements
StockyDropdown.prototype.addElements = function(){

    // create the empty dropdown element for clearing all options.
    new StockySelectableOption(this.dropdownBody,-1,'Clear Selection',-1,
        (function(){
            this.clearSelections();
        }).bind(this)
    );

    // iterate over each row in the body data object
    for(var elements = 0 ; elements < this.bodyData.length ; elements++){
        // create new stocky dropdown option with html parent div, this rows key and value, the index, a pointer to the dropdown object and the type of option
        this.options.push(new StockySelectableOption(this.dropdownBody,this.bodyData[elements][this.keyValAssociation[0]],this.bodyData[elements][this.keyValAssociation[1]],elements,
            (function(index){
                this.handleSelection(index);
            }).bind(this)
        ));
    }

};

// method to add tool tip to control
StockyDropdown.prototype.addToolTip = function (tooltipPos,toolTopContent) {

    // default naming behaviour incase of undefined parameters
    if(tooltipPos === undefined) tooltipPos = 'right';
    if(toolTopContent === undefined) toolTopContent = this.stackable ? 'Select Multiple Options!' : 'Select One Option!';

    // new stocky tool tip object.
    StockyToolTip(this.dropdownBody ,tooltipPos,toolTopContent);

};

// get data method that returns all selected data members.
StockyDropdown.prototype.getSelectedData = function(){
    return this.selectedOptions;
};




// a component similar to a dropdown but one where elements are filtered via a search query and
// "similar" elements of a dataset are returned.
function StockySearch(parent,keyValAssociation) {

    this.searchParent = parent;
    this.search = $('<div class="dropdown" id="search_' + this.searchParent + '"></div>').appendTo(this.searchParent);

    this.searchBar = $('<input id="search_textbox_' + this.searchParent + '" class="form-control" type="text" value="" data-toggle="dropdown">')
        .keyup((function () { this.filterSelections(this.searchBar.val());}).bind(this))
        .appendTo(this.search);

    this.searchResults   = $('<div id="search_body'+this.searchParent +'" class="dropdown-menu" aria-labelledby="search_results_box"></div>').appendTo(this.search);

    this.bodyData = null;

    this.options = [];

    this.keyValAssociation = keyValAssociation;

}

StockySearch.prototype.init = function(){
    this.searchResults.empty();
    this.options = [];
    this.addSearchable();
};

StockySearch.prototype.setBodyData = function(data){
    this.bodyData = data;
};

StockySearch.prototype.addSearchable = function(){

    for(var elements = 0 ; elements < this.bodyData.length ; elements++){

        this.options.push(new StockyDropDownOption(this.searchResults,this.bodyData[elements][this.keyValAssociation[0]],this.bodyData[elements][this.keyValAssociation[1]],elements,this,'option'));

    }

};

StockySearch.prototype.filterSelections = function (filter) {

    for(var options = 0 ; options < this.options.length ; options++){
        if(filter === ""){
            this.options[options].showOption();
            continue;
        }
        if(this.options[options].optionValue.toString().toUpperCase().includes(filter.toString().toUpperCase())){
            this.options[options].showOption();
        } else {
            this.options[options].hideOption();
        }
    }

};

StockySearch.prototype.getSearch = function(){
    return this.searchBar.val().toString();
};

// control that creates a new row in database on creation, then will continue to update that id on keyup
function StockyUnique(parent,keyValAssociation,componentReference){

    this.isUnique = true;

    this.unique = $('<input id="search_textbox_' + parent + '" class="form-control" type="text" value="">')
        .keyup((function () { this.isUnique = this.isDuplicate(this.unique.val());}).bind(this))
        .appendTo(parent);

    this.bodyData = null;

    // storing last value of input for comparison
    this.inputCurrent = "";

    this.keyValAssociation = keyValAssociation;

    this.componentReference = componentReference;


}

StockyUnique.prototype.isDuplicate = function (filter) {

    this.inputCurrent = filter;

    // simple search logic, look at each element of the dataset in the relevent column and check its uppercase
    // value is the same as the searches upper case logic.
    for(var i = 0 ; i < this.bodyData.length ; i++){
        if(this.bodyData[i][this.keyValAssociation[1]].toUpperCase() === filter.toUpperCase()){
            console.log("Duplicate Found");
            this.unique.css({'background-color':'#e74c3c','color':'white'});
            return true;
        }
    }
    this.unique.css({'background-color':'#2ecc71','color':'white'});
    console.log("Duplicate Not Found");
    return false;
};

StockyUnique.prototype.setBodyData = function(data){
    this.bodyData = data;
};