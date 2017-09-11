/**
 * Created by Overlord on 22/08/2017.
 */

var enableToolTips = false;

function StockyToolTip(parent,position,content){

    if(enableToolTips){
        parent.attr('data-toggle', 'tooltip');
        parent.attr('data-placement', position);
        parent.attr('title', content);

        parent.tooltip();
    }

}

function StockyButton(parent,content,style,callback,tooltipPos,toolTopContent){

    this.button = null;
    this.buttonParent = parent;
    this.buttonContent = content;
    this.buttonType = style;

    this.init(callback);

    // adding tool tip to control
    this.tooltip = new StockyToolTip(this.button,tooltipPos,toolTopContent);

}

StockyButton.prototype.init = function (callback) {
    this.button = $('<button type="button"  class="btn btn-outline-'+this.buttonType+'" >'+this.buttonContent+'</button>').appendTo(this.buttonParent);

    this.button.click((function(){
        if(typeof callback === 'function') callback();
    }).bind(this));
};

StockyButton.prototype.get = function () {return this.button;};



function StockyTextBox(parent,id,content,callback,type,tooltipPos,toolTopContent){

    this.textbox = null;
    this.textboxParent = parent;
    this.textboxId = id;
    this.textboxType = type;
    this.textboxContent = content;

    this.init(callback);

    if(tooltipPos === undefined) tooltipPos = 'right';
    if(toolTopContent === undefined) toolTopContent = 'Enter Text Here!';

    StockyToolTip(this.textbox,tooltipPos,toolTopContent);

}

StockyTextBox.prototype.init = function (callback) {
    this.textbox = $('<input id="'+this.textboxId+'" class="form-control" type="text" value="'+this.textboxContent+'">').appendTo(this.textboxParent);
    this.textbox.keyup((function(){

        if(Validation.Type(this.textboxType,this.textbox.val())){
            this.textbox.css({'background-color':'#2ecc71','color':'white'});
        } else {
            this.textbox.css({'background-color':'#e74c3c','color':'white'});
        }

        if(typeof callback === 'function') callback(this.textbox.val());

    }).bind(this));
};

StockyTextBox.prototype.get = function () {return this.textbox;};

StockyTextBox.prototype.getData = function () {return this.textbox.val();};

function StockyScanTextBox(parent,id,content,dataType,callback,tooltipPos,toolTopContent){

    this.textbox = null;
    this.textboxParent = parent;
    this.textboxId = id;
    this.textboxContent = content;
    this.textBoxDataType = dataType;
    this.scannedElements = [];

    this.init(callback);

    if(tooltipPos === undefined) tooltipPos = 'top';
    if(toolTopContent === undefined) toolTopContent = 'Enter Items one by one uses spaces or commas to separate items (1,2,3 or 1 2 3)';

    // adding tool tip to control
    this.tooltip = new StockyToolTip(this.textbox,tooltipPos,toolTopContent);

}

StockyScanTextBox.prototype.init = function (callback) {
    this.textbox = $('<input id="'+this.textboxId+'" class="form-control" type="text" value="'+this.textboxContent+'">').appendTo(this.textboxParent);
    this.textboxContainer = $('<div style="overflow: auto"></div>').appendTo(this.textboxParent);
    this.textboxScanResult = $('<table></table>').appendTo(this.textboxContainer);
    this.textbox.keyup((function(){

        this.parse(this.textbox.val());

        if(typeof callback === 'function') callback(this.scannedElements);

    }).bind(this));
};

StockyScanTextBox.prototype.parse = function (input) {

    this.scannedElements = [];

    // this.scannedElements = input.split(this.textboxDelimiter);
    this.scannedElements = input.split(/[\s,]+/);

    this.textboxScanResult.empty();

    // check for invalid entries
    for(var i = this.scannedElements.length - 1 ; i > -1 ; i--){
        if(!Validation.Type('NULL',this.scannedElements[i])){
            this.scannedElements.splice(i,1);
            continue;
        }
        if(!Validation.Type(this.textBoxDataType,this.scannedElements[i])){
            var enumeratedButton = $('<td class="table-hover"><button type="button" class="btn btn-danger">'+this.scannedElements[i]+'</button></td>').prependTo(this.textboxScanResult);

            StockyToolTip(enumeratedButton,'bottom','Sizes can only be Number/s or Letter/s');

            this.scannedElements.splice(i,1);
        } else {
            var enumeratedButton = $('<td class="table-hover"><button type="button" class="btn btn-success-light">'+this.scannedElements[i]+'</button></td>').prependTo(this.textboxScanResult);

            StockyToolTip(enumeratedButton,'bottom','This size is valid!');
        }

    }



    // check for duplicates


    // for(var i = 0 ; i < this.scannedElements.length ; i++){
    //     $('<td class="table-hover"><button type="button" class="btn btn-secondary">'+this.scannedElements[i]+'</button></td>').appendTo(this.textboxScanResult);
    // }

    // console.log(this.scannedElements);

};

// TODO: This returns the textbox jquery object but leaves the scanned items textbox (encapsulate better)
StockyScanTextBox.prototype.get = function () {return this.textbox;};

StockyScanTextBox.prototype.getData = function () {return this.scannedElements;};

function StockyCheckBox(parent,id,state,callback,tooltipPos,toolTopContent){

    this.checkbox = null;
    this.checkboxParent = parent;
    this.checkboxId = id;
    this.checkboxstate = state;

    this.init(callback);

    if(tooltipPos === undefined) tooltipPos = 'right';
    if(toolTopContent === undefined) toolTopContent = 'Tick = Yes, Empty = No';

    StockyToolTip(this.checkbox,tooltipPos,toolTopContent);

}

StockyCheckBox.prototype.init = function (callback) {

    this.checkbox = $('<div class="btn-group" data-toggle="buttons">' +
        '<label class="btn btn-info active">' +
        '<input type="checkbox" autocomplete="off" checked>' +
        '<span id="'+this.checkboxId+'" class="glyphicon glyphicon-ok">' +
        '</span>' +
        '</label>' +
        '</div>')
        .appendTo(this.checkboxParent)
        .find("span").css({'opacity':(this.checkboxstate ? 1 : 0)});

    this.checkbox.click((function(){
        if(typeof callback === 'function') callback();
    }).bind(this));

};

StockyCheckBox.prototype.toggle = function (state) {

    this.checkbox.find("span").css({'opacity':(state ? 1 : 0)})

};

StockyCheckBox.prototype.get = function () {return this.checkbox;};
