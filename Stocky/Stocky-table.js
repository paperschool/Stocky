/**
 * Created by Overlord on 13/08/2017.
 */

function StockyCell(parent,data,isHeader,cellType,index,rowPointer,dataType){

    this.rowPointer = rowPointer;

    this.cellIndex = index;

    this.isHeader = isHeader;

    this.cellParent = parent;

    this.cell = null;

    this.cellData = data;

    this.cellType = cellType;
    this.cellDataType = dataType;

    if(this.isHeader){
        this.cellName = idcon(this.cellParent.attr('id'),'c',this.cellIndex);
    } else {
        this.cellName = idcon(this.cellParent.attr('id'),'c',this.cellIndex);
    }

    this.renderCell(data);

}

StockyCell.prototype.highlight = function(type){
    switch(type){
        case 'wrong': this.cell.css({ "background-color":'#cc6c53'}); break;
        case 'correct': this.cell.css({ "background-color":'#2ecc71'}); break;
    }

};

StockyCell.prototype.renderCell = function(){

    switch (this.cellType)
    {
        case 'normal' : this.renderNormalCell(); break;
        case 'button' : this.renderButtonCell(); break;
        case 'switch' : this.renderSwitchCell(); break;
    }
};


StockyCell.prototype.renderNormalCell = function(){

    if(this.isHeader){
        this.cell = $('<th id="'+this.cellName+'" >'+this.cellData+'</th>').appendTo(this.cellParent);
    } else {
        this.cell = $('<td  class="'+this.cellName+'"></td>').appendTo(this.cellParent);

        var callback = (function(text){

            this.rowPointer.rowEdited();
            this.rowPointer.rowData[this.cellIndex] = text;
            // FIX ASAP...
            this.rowPointer.tableReference.componentParent.unsavedState = true;

        }).bind(this);

        this.cell = new StockyTextBox(this.cell,this.cellName,this.cellData,callback,this.cellDataType).get();
    }

};

StockyCell.prototype.renderButtonCell = function(){

    if(this.isHeader) { // nothing to do here
    } else {
        var callback = (function(){this.rowPointer.deleteRow();}).bind(this);
        this.cell = $('<td></td>').appendTo(this.cellParent);
        this.cell = new StockyButton(this.cell,'X','danger',callback,'right','Delete Current Row!').get();
    }
};

StockyCell.prototype.deleteRow = function(){
  console.log(this.cellData);
};

StockyCell.prototype.renderSwitchCell = function(){

    if(!this.isHeader) {
        this.cell = $('<td></td>').appendTo(this.cellParent);

        var callback = (function() {
            this.rowPointer.rowEdited();

            this.cellData = !this.cellData;

            this.rowPointer.rowData[this.cellIndex] = this.cellData;

            this.cell.css({'opacity': (this.cellData ? 1 : 0)});

        }).bind(this);

        this.cell = new StockyCheckBox(this.cell,this.cellName,this.cellData,callback).get();


    }
};

function StockyRow(columnTypes,parent,data,activeHeaders,isHeader,index,isNew,tableReference,displayOnly) {

    this.columnTypes = columnTypes;

    this.tableReference = tableReference;

    this.isNew = isNew;
    this.isHeader = isHeader;
    this.rowActiveHeaders = activeHeaders;

    this.rowParent = parent;
    this.rowData = data;
    this.row  = null;

    if(isHeader){
        this.rowName = idcon(this.rowParent.attr('id'),'r','h');
    } else {
        this.rowName = idcon(this.rowParent.attr('id'),'r',index);
    }

    this.cells = [];

    this.renderRow();
    this.addCells();

    if(!displayOnly){
        this.addButtonCell();
    }


}

StockyRow.prototype.renderRow = function(){

    this.row = $('<tr id="'+this.rowName+'"></tr>')
        .effect("highlight", { color: '#2ecc71' }, 500)
        .appendTo(this.rowParent);

};

/**
 * This function will create a cell object for each column in the row data object, when creating the cell
 * it will specify the parent, the row data, the array of active headers, a boolean flag denoting if its a
 * table header or not, a cell button flag and an index for the row id
 */
StockyRow.prototype.addCells = function(){

    var self = this;

    // iterate across the array of active headers using only those index
    for( var i = 0 ; i < this.rowActiveHeaders.length ; i++ ){

        var cellType = (function(){

            if(self.isHeader){
                return 'normal';
            }

            switch(self.columnTypes[self.rowActiveHeaders[i]]){
                case 'STRING': case 'ID' :case 'INT':
                    return 'normal'; break;
                case   'BOOL':
                    return 'switch'; break;
                default : return 'normal'; break;
            }
        })();

        if(this.isNew){
            // store new cell object to cell var
            this.cells.push(new StockyCell(this.row,'',this.isHeader,cellType,this.rowActiveHeaders[i],this,self.columnTypes[self.rowActiveHeaders[i]]));
        } else {
            this.cells.push(new StockyCell(this.row,this.rowData[this.rowActiveHeaders[i]],this.isHeader,cellType,this.rowActiveHeaders[i],this,self.columnTypes[self.rowActiveHeaders[i]]));
        }
    }

};

StockyRow.prototype.rowEdited = function () {

    if(this.rowData[this.rowData.length-1] === 0 || this.rowData[this.rowData.length-1] === 2){
        this.rowData[this.rowData.length-1] = 2;
    } else {
        this.rowData[this.rowData.length-1] = 1;
    }

};


StockyRow.prototype.deleteRow = function () {

    this.tableReference.componentParent.unsavedState = true;

    // this.row.effect("highlight", { color: '#cc6c53' }, 1000);

    this.row.effect('highlight', { color: '#cc6c53' }, 200, function(){
        $(this).remove();

        // fade was distracting
        // $(this).fadeOut('fast', function(){
        //     $(this).remove();
        // });
    });

    if(this.rowData[this.rowData.length - 1] === 0 || this.rowData[this.rowData.length-1] === 2){
        this.rowData[this.rowData.length - 1] = -1;
    } else if(this.rowData[this.rowData.length - 1] === 1) {
        this.rowData[this.rowData.length - 1] = -2;
    }


};

StockyRow.prototype.addButtonCell = function () {

    this.cells.push(new StockyCell(this.row,null,this.isHeader,'button',this.rowActiveHeaders.length+1,this));

};



/**
 * Constructor for Stocky Table Class that will allow for the rendering, interactivity and full effective control of
 * a table of data, which has been parsed in from a json object
 * @param parent - The html element that will contain the table object
 * @param data   - The json object that will be parsed and converted to data
 * @param activeHeaders - An array of column index's that the builder has specified is to be displayed
 *
 * TODO:  Integrate dataset updates with each interaction of the table, eg Deleting a row on the table will delete the
 * TODO - the associated row in the dataset, and further more will delete the data on the epos system
 *
 * TODO: Intelligent Get
 *
 * TODO: Allow for non-json object to be passed in
 *
 * TODO: Have all headers be created but set to visible/hidden depending on active headers object
 *
 *
 */
function StockyTable(parent,headerData,bodyData,activeHeaders,component,displayOnly){

    this.tableParent = parent;
    this.table       = $('<table class="table table-hover" id="'+this.tableParent+'_table" ></table>').appendTo(this.tableParent);
    this.tableHeader = $('<thead id="'+idcon(this.tableParent,'h')+'"></thead>').appendTo(this.table);
    this.tableBody   = $('<tbody id="'+idcon(this.tableParent,'b')+'"></tbody>').appendTo(this.table);

    this.headerData = headerData;
    this.bodyData = bodyData;

    this.rows = [];
    this.activeHeaders = activeHeaders;

    this.columnTypes = [];

    this.componentParent = component;

    this.container = undefined;

    this.displayOnly = displayOnly;

    this.newRowButton = null;
    this.saveTableButton = null;

}

StockyTable.prototype.setHeaderType = function(data) {
    // fetching current table preference object
    var pref = Stocky.getPreference(this.componentParent.dataSetReference.getPreferenceKey());

    for(var key in pref){
        this.columnTypes.push(pref[key]);
    }

};

StockyTable.prototype.setHeaderData = function(data) {
    this.headerData = data;
};

StockyTable.prototype.setBodyData = function(data) {
    this.bodyData = data;
};

StockyTable.prototype.init = function() {
    this.rows = [];
    this.tableHeader.empty();
    this.tableBody.empty();
    this.setHeaderType();
    this.addHeaderRow();
    this.addRows();
    if(!this.displayOnly){
        this.addControls();
    }
};

StockyTable.prototype.refresh = function() {
    this.rows = [];
    this.tableBody.empty();
    this.addRows();

};

/**
 * Function that adds an empty row to the able by finding the last row and adding another row to ir
 * TODO: Fix data array with something better than a highest guess array DONE
 * DONE: By adding a constructor parameter to the row creation that informs the object thats its a new row
 *
 * TODO: Fix numeric index for new row (get row count) DONE
 * DONE: By fetching row count from size of row object array subtract 1;
 *
 * TODO: Handle empty data situation;
 */
StockyTable.prototype.addRow = function () {

    var nullData = [];

    var cycleData = this.bodyData;

    if(this.bodyData.length === 0){
        for(var i = 0 ; i < this.headerData.length ; i++){
            // to set the "action" column to new
            if(i === this.headerData[0].length -1){
                nullData.push(1);
            } else {
                nullData.push('');
            }
        }
    } else {
        for(var i = 0 ; i < this.bodyData[0].length ; i++){
            // to set the "action" column to new
            if(i === this.bodyData[0].length -1){
                nullData.push(1);
            } else {
                nullData.push('');
            }
        }
    }

    this.rows.push(new StockyRow(this.columnTypes,this.tableBody,nullData,this.activeHeaders,false,this.rows.length - 1,true,this));

    $('html,body').animate({
            scrollTop: this.rows[this.rows.length-1].row.offset().top},
        'slow');




}

StockyTable.prototype.addHeaderRow = function(){
    new StockyRow(this.columnTypes,this.tableHeader,this.headerData,this.activeHeaders,true,0,false,this,this.displayOnly);
}

/**
 * This function will iterate across all the rows of the dataset and instantiate a row object for each row of data.
 * Differentiating the head of the table from the rows of the table with the boolean flag.
 */
StockyTable.prototype.addRows = function(){
    for( var i = 0 ; i < this.bodyData.length ; i++ ){
        this.rows.push(new StockyRow(this.columnTypes,this.tableBody,this.bodyData[i],this.activeHeaders,false,i+1,false,this,this.displayOnly));
    }
};

/**
 * Function that iterates across the table comparing its row-cell value with the json pref objects "expected" data type
 * the function will skip rows that are deleted or haven't been edited ( no validation needed ) and highlights any other
 * cells either green if successfully validated or red if not correct. The function returns false blocking the api request call
 * from occuring
 * @returns {boolean} - validation success boolean
 */
StockyTable.prototype.validateTable = function(){

    // fetching current table preference object
    var pref = Stocky.getPreference(this.componentParent.dataSetReference.getPreferenceKey());

    // validation success state boolean
    var state = true;

    // for loop iterating across row data
    for(var row = 0 ; row <  this.rows.length ; row++) {

        // rowdata index variable
        var cell = 0;

        // this line skips any rows that are to be deleted or havent been edited as no validation is needed.
        var actionCol = this.rows[row].rowData[this.rows[row].rowData.length - 1];
        if(actionCol === -1 || actionCol === -2 || actionCol === 0) continue;

        // this for each loop iterates across the pref object comparing its value with the cell content's type
        for(var key in pref){

            //this condition checks if the cell its checking is event a displayed/editable cell in the table control
            if(this.activeHeaders[cell] === cell)

                if(Validation.Type(pref[key],this.rows[row].rowData[cell])){
                    this.rows[row].cells[cell].highlight("correct");
                } else {
                    this.rows[row].cells[cell].highlight("wrong");
                    state = false;
                }

            cell++;
        }
    }
    if(!state){
        print(" > Validation Failed");
    }
    return state;
};

StockyTable.prototype.requestBuilder = function(){

    var rawData = this.rows;

    var uneditedData = [];
    var newData = [];
    var editedData = [];
    var deletedData = [];

    for(var row = 0 ; row < rawData.length ; row++) {

        var dataRowLength = rawData[row].rowData.length;
        if (rawData[row].rowData[dataRowLength - 1] === -2){
            continue;
        }
        if (rawData[row].rowData[dataRowLength - 1] === -1) {

            this.componentParent.requestBuilder('DELETE',rawData[row].rowData);

            // deletedData.push(this.objectBuilder(rawData[row].rowData));
            continue;
        }
        if (rawData[row].rowData[dataRowLength - 1] === 1){
            // newData.push(this.objectBuilder(rawData[row].rowData));

            this.componentParent.requestBuilder('POST',rawData[row].rowData);

            continue;
        }
        if (rawData[row].rowData[dataRowLength - 1] === 2){

            this.componentParent.requestBuilder('PUT',rawData[row].rowData);

            // editedData.push(this.objectBuilder(rawData[row].rowData));
            continue;
        }
        // uneditedData.push(this.objectBuilder(rawData[row].rowData));

    }

    // print("Rows Unedited: ");
    // print(JSON.stringify(uneditedData, null, 4));


    // if(newData.length !== 0){
    //     // print("Rows  Created: ");
    //     // print(JSON.stringify(newData, null, 4));
    //     this.requestQueue.append(this.requestLine,'POST',JSON.stringify(newData));
    // }
    //
    // if(editedData.length !== 0){
    //     // print("Rows   Edited: ");
    //     // print(JSON.stringify(editedData, null, 4));
    //     this.requestQueue.append(this.requestLine,'PUT',JSON.stringify(editedData));
    // }
    //
    // if(deletedData.length !== 0){
    //     // print("Rows  Deleted: ");
    //     // print(JSON.stringify(deletedData, null, 4));
    //     this.requestQueue.append(this.requestLine,'DELETE',JSON.stringify(deletedData));
    // }

};

StockyTable.prototype.addControls = function () {

    if(typeof this.container !== 'undefined'){
        this.container.empty();
        this.container.remove();
    }


    if(this.newRowButton !== null && this.saveTableButton  !== null){
        this.newRowButton.remove();
        this.saveTableButton.remove();
    }

    this.container = $('<div class="row justify-content-between"></div>').appendTo($('<div class="container"></div>').appendTo(this.tableParent));


    this.saveTableButton    = $('<div class="col-4"></div>').appendTo(this.container);

    this.saveTableButton = new StockyButton( this.saveTableButton,'Save!','success',
        (function(){

            // this.controls[1].button('loading');
            //
            // setTimeout((function () {
            //
            //     this.controls[1].button('reset')
            //
            // }).bind(this), 3000);

            this.saveTable()

        }).bind(this),
        'right','Save Table Information!'
    ).get();

    this.newRowButton    = $('<div class="col-4"></div>').appendTo(this.container);

    this.newRowButton = new StockyButton( this.newRowButton,'+','info',(function(){this.addRow();}).bind(this),'right','Add new Row!').get();





};

StockyTable.prototype.saveTable = function () {
    if(this.validateTable())
        this.requestBuilder();

};