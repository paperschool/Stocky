/**
 * Created by Overlord on 20/08/2017.
 */

function StockyDropDownOption(parent,key,value,index,parentReference,type){

    this.parentReference = parentReference;

    this.optionParent = parent;
    this.optionKey = key;
    this.optionValue = value;
    this.optionIndex = index;

    this.optionType = type;

    this.filterValue = null;

    this.option = null;

    this.selected = false;

    switch(this.optionType){
        case 'option': this.renderOption(); break;
        case 'clear' : this.renderClear(); break;
    }

};

StockyDropDownOption.prototype.renderOption = function () {

    var self = this;

    var state = this.selected ? 'X' : '';

    self.option = $('<div><a class="dropdown-item" id="'+self.optionParent+'_dropdown_option_'+self.optionIndex+'" href="#">'+self.optionValue+'</a><span>'+state+'</span></div>')
        .effect("highlight", { color: '#2ecc71' }, 500)
        .appendTo(self.optionParent);


    self.option.click(function () {

        self.toggleOption();
        self.parentReference.handleSelection(self.optionIndex);
        console.log("Dropdown Option Clicked..." + self.optionKey + " : " + self.optionValue + " @ " + self.optionIndex);
    });

};

StockyDropDownOption.prototype.renderClear = function () {

    var self = this;

    self.option = $('<div><a class="dropdown-item" id="'+self.optionParent+'_dropdown_option_clear" href="#">Clear Selection</a><span></span></div><hr>')
        .effect("highlight", { color: '#2ecc71' }, 500)
        .appendTo(self.optionParent);


    self.option.click(function () {
        self.parentReference.clearSelections(self.optionIndex);
        console.log("Dropdown Clear Clicked... Emptying Selections");
    });

};

StockyDropDownOption.prototype.toggleOption = function () {

    var self = this;

    var normalColour = '',hoverColour = '';

    this.selected = !this.selected;

    if(this.selected){
        normalColour = '#2ecc71';
        hoverColour  = '#4af392';
    } else {
        normalColour = '#fff';
        hoverColour  = '#d5d3c8';
    }


    self.option.hover(function () {
        self.option.css({"background-color":normalColour});
    });

    self.option.css({"background-color":normalColour});



};


function StockyDropdown(parent,bodyData,keyValAssociation,stackable){

    this.stackable = stackable;

    this.dropdownParent = parent;
    this.dropdown       = $('<div class="dropdown" id="dropdown_'+this.dropdownParent +'"></div>').appendTo(this.dropdownParent);
    this.dropdownButton = $('<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdown_button_'+this.dropdownParent +'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Select Items</button>').appendTo(this.dropdown);
    this.dropdownBody   = $('<div id="dropdown_body'+this.dropdownParent +'" class="dropdown-menu" aria-labelledby="dropdownMenuButton"></div>').appendTo(this.dropdown);

    this.bodyData = bodyData;

    this.options = [];

    this.keyValAssociation = keyValAssociation;

    this.selectedOptions = [];

    this.addToolTip();

}

// TODO: Updating dropdown mustn't effect displayed selected options array or text

StockyDropdown.prototype.init = function(){
    this.selectedOptions = [];
    this.dropdownBody.empty();
    this.options = [];
    this.addElements();
    this.displaySelected();
};

StockyDropdown.prototype.clearSelections = function () {

    this.selectedOptions = [];

    for(var option = 0 ; option < this.options.length ; option++){
        if(this.options[option].selected)
            this.options[option].toggleOption();
    }

    this.displaySelected();

};


StockyDropdown.prototype.handleSelection = function (index) {
    if(this.stackable){
        this.combineSelected(index);
    } else {
        this.swapSelected(index);
    }
};


StockyDropdown.prototype.swapSelected = function (index) {

    // checking if active option has simply been de-selected
    if(this.bodyData[index] === this.selectedOptions[0]){
        this.selectedOptions = [];
        return;
    }

    // iterating across options to both dicard old selection and select new option
    for(var option = 0 ; option < this.options.length ; option++){
        if(this.options[option].selected && this.options[option].optionIndex !== index){
            this.options[option].toggleOption();
        }
        if(this.options[option].optionIndex === index){
            this.selectedOptions[0] = this.bodyData[option];
        }
    }

    this.displaySelected();

};

StockyDropdown.prototype.combineSelected = function (index) {

    this.selectedOptions = [];

    for(var option = 0 ; option < this.options.length ; option++){
        if(this.options[option].selected){
            this.selectedOptions.push(this.bodyData[option]);
        }
    }

    this.displaySelected();

};

StockyDropdown.prototype.getSelectedData = function(){
    return this.selectedOptions;
};

StockyDropdown.prototype.displaySelected = function () {

    var buttonText = '';

    for(var selected = 0 ; selected < this.selectedOptions.length ; selected++){
        buttonText += this.selectedOptions[selected][this.keyValAssociation[1]].toString() + (this.stackable ? ', ' : '');
    }

    if(buttonText === ''){
        buttonText = 'Select Items';
    }

    this.dropdownButton.html(buttonText);

};

StockyDropdown.prototype.setBodyData = function(data){
    this.bodyData = data;
};

StockyDropdown.prototype.addElements = function(){

    var self = this;

    new StockyDropDownOption(this.dropdownBody,null,null,-1,this,'clear');

    for(var elements = 0 ; elements < this.bodyData.length ; elements++){

        // skip rendering this row if both a filter value is set (!== null) and if the data stored in the current row at
        // the filter objects 'header' column index is not the same as the data stored in the filter objects 'value' value.
        if(typeof this.filterValue !== 'undefined'){
            if(this.bodyData[selector][this.filterValue['header']] !== this.filterValue['header']){
                continue;
            }
        }

        this.options.push(new StockyDropDownOption(this.dropdownBody,this.bodyData[elements][this.keyValAssociation[0]],this.bodyData[elements][this.keyValAssociation[1]],elements,this,'option'));

    }

};

StockyDropdown.prototype.addToolTip = function (tooltipPos,toolTopContent) {

    if(tooltipPos === undefined) tooltipPos = 'right';
    if(toolTopContent === undefined) toolTopContent = this.stackable ? 'Select Multiple Options!' : 'Select One Option!';

    StockyToolTip(this.dropdownBody ,tooltipPos,toolTopContent);
}