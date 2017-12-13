/**
 * Created by Overlord on 13/08/2017.
 */

/**
 * Cell object that holds cell type, index, data and cell interaction event behaviour
 * @param parent     - Parent div for cell
 * @param data       - Data to be displayed in cell
 * @param isHeader   - Boolean determining if cell is a header cell
 * @param cellType   - Cell type (Button, Checkbox, Textbox etc)
 * @param index      - Cell Index in row
 * @param rowPointer - Pointer to Row Object
 * @param dataType   - Datatype of given cell (INT, BOOL, STRING etc)
 * @constructor
 */
function StockyCell(parent,data,isHeader,cellType,index,rowPointer,dataType){

    // pointer to parent row object
    this.rowPointer = rowPointer;

    // index of cell in row
    this.cellIndex = index;

    // true if cell is a header cell
    this.isHeader = isHeader;

    // Parent row div
    this.cellParent = parent;

    // object storing all cell html
    this.cell = null;

    // Cell Data
    this.cellData = data;

    // Cell Type (button, checkbox etc)
    this.cellType = cellType;

    // Cell Data Type (Int, Bool, String etc)
    this.cellDataType = dataType;

    // checking if cell is header or not
    if(this.isHeader){
        this.cellName = idcon(this.cellParent.attr('id'),'c',this.cellIndex);
    } else {
        this.cellName = idcon(this.cellParent.attr('id'),'c',this.cellIndex);
    }

    // Render cell object
    this.renderCell(data);

}

/**
 * Highligting cell css background colour red or green for visual display of validation success
 * @param type
 */
StockyCell.prototype.highlight = function(type){

    if(this.cellType !== 'normal'){
        return;
    }

    switch(type){
        case 'wrong': this.cell.css({ "background-color":'#cc6c53'}); break;
        case 'correct': this.cell.css({ "background-color":'#2ecc71'}); break;
    }

};

// Method to determine which cell is to be rendered
StockyCell.prototype.renderCell = function(){

    // this switch will run the appropriate method for the cell being generated
    switch (this.cellType)
    {
        // normal means textbox
        case 'normal' : this.renderNormalCell(); break;
        // button means render a button cell
        case 'button' : this.renderButtonCell(); break;
        // switch means render a checkbox
        case 'switch' : this.renderSwitchCell(); break;
    }
};

// render normal cell method to render simple textbox
StockyCell.prototype.renderNormalCell = function(){

    // if header create cell with table header-esk html
    if(this.isHeader){
        this.cell = $('<th id="'+this.cellName+'" >'+this.cellData+'</th>').appendTo(this.cellParent);
    } else {
        this.cell = $('<td  class="'+this.cellName+'"></td>').appendTo(this.cellParent);

        // create callback method
        var callback = (function(text){

            // pass cell index and content informing row object of cell edit.
            this.rowPointer.rowEdited(this.cellIndex,text);

            // FIX ASAP... yeah
            this.rowPointer.tableReference.componentParent.unsavedState = true;

        }).bind(this);

        // create new cell with html pointer to cell, cellname, data, callback method, datatype && run method to return object.
        this.cell = new StockyTextBox(this.cell,this.cellName,this.cellData,callback,this.cellDataType).get();
    }

};

// render button cell method to render simple button (Delete button only atm)
StockyCell.prototype.renderButtonCell = function(){

    // do nothing if in header row (nothing to edit in the header row data)
    if(this.isHeader) { // nothing to do here
    } else {

        // create cell html
        this.cell = $('<td></td>').appendTo(this.cellParent);

        // generate callback as method that runs parent row object deleterow() method.
        var callback = (function(){this.rowPointer.deleteRow();}).bind(this);

        // create button object with cell div, button body text, button style, callback and tooltip preferences && method to return button object.
        this.cell = new StockyButton(this.cell,'X','danger',callback,'right','Delete Current Row!').get();
    }
};

// render switch cell method to render simple checkbox
StockyCell.prototype.renderSwitchCell = function(){

    // only run if not header
    if(!this.isHeader) {
        // create html for cell
        this.cell = $('<td></td>').appendTo(this.cellParent);

        // create call back to be run on checkbox click
        var callback = (function(state) {

            // run row object pointer rowEdited() method
            this.rowPointer.rowEdited(this.cellIndex,state);

        }).bind(this);

        // create new checkbox control with cell div, cell name, cell data and callback && returning checkbox object.
        this.cell = new StockyCheckBox(this.cell,this.cellName,this.cellData,callback).get();


    }
};

/**
 * Row object that moderates all interaction with its own row, storing data and keeping track of changes.
 * @param columnTypes    - All Dataypes associated with each column
 * @param parent         - Parent div
 * @param data           - Data for each cell in that row
 * @param activeHeaders  - Headers to be displayed
 * @param isHeader       - Boolean flag determining if row is header
 * @param index          - Index of row in table
 * @param isNew          - Boolean flag determining if row is new
 * @param tableReference - Reference to Parent Table Object
 * @param displayOnly    - Boolean flag determining if row should have controls or simply be display only
 * @constructor          - defines all variables used throughout object
 */
function StockyRow(columnTypes,parent,data,activeHeaders,isHeader,index,isNew,tableReference,displayOnly) {

    // array of datatypes for each column
    this.columnTypes = columnTypes;

    // reference to parent object
    this.tableReference = tableReference;

    // boolean true if new row
    this.isNew = isNew;
    // boolean true if row is header row
    this.isHeader = isHeader;

    // array of columns to display
    this.rowActiveHeaders = activeHeaders;

    // row parent div
    this.rowParent = parent;

    // array of row data
    this.rowData = data;

    // object holding row html
    this.row = null;

    if (isHeader) {
        this.rowName = idcon(this.rowParent.attr('id'), 'r', 'h');
    } else {
        this.rowName = idcon(this.rowParent.attr('id'), 'r', index);
    }

    // array storing all cell objects
    this.cells = [];

    // render row method
    this.renderRow();

    // method to add all cell objects within row
    this.addCells();

    // add controls if row is not a display only row
    if (!displayOnly) {
        this.addButtonCell();
    }

}

// method to simply render row div with animation
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

    // loop across active headers
    for( var i = 0 ; i < this.rowActiveHeaders.length ; i++ ){

        // determine cell type by associated datatype with column
        var cellType = (function(){

            // return as normal text
            if(self.isHeader){
                return 'normal';
            }

            // fetching datatype from associated value of active header
            switch(self.columnTypes[self.rowActiveHeaders[i]]){
                case 'STRING': case 'ID' :case 'INT':
                    return 'normal'; break;
                case   'BOOL':
                    return 'switch'; break;
                default : return 'normal'; break;
            }
        })();

        this.cells.push(new StockyCell(
            this.row,
            this.isNew ? '' : this.rowData[this.rowActiveHeaders[i]],
            this.isHeader,cellType,this.rowActiveHeaders[i],this,this.columnTypes[this.rowActiveHeaders[i]]));

    }

};

/**
 * Method ran when textbox content is changed (keyup even)
 * @param index   - The json key associated with that cell
 * @param content - The content of the input.
 */
StockyRow.prototype.rowEdited = function (index,content) {

    // this block determines action column data of this row based on its current value
    // if 0 or 2, this means that data in in the database needs to be updated with the new values here
    // otherwise, the data is a new row and has been edited, this means the data needs to be created new in the database
    if(this.rowData['ACTION'] === 0 || this.rowData['ACTION'] === 2){
        this.rowData['ACTION'] = 2;
    } else {
        this.rowData['ACTION'] = 1;
    }

    this.rowData[index] = content;

};

// method called on button press in the delete button cell
StockyRow.prototype.deleteRow = function () {

    // modify saved state of table for later reference (not used yet)
    this.tableReference.componentParent.unsavedState = true;

    // this.row.effect("highlight", { color: '#cc6c53' }, 1000);

    // deletion effect on butotn press
    this.row.effect('highlight', { color: '#cc6c53' }, 200, function(){

        // emptying this row's child html
        $(this).remove();

        // fade was distracting
        // $(this).fadeOut('fast', function(){
        //     $(this).remove();
        // });
    });

    // this block determines action column data of this row based on its current value
    // if 0 or 2 this means the deleted value row has to be updated in the database
    if(this.rowData['ACTION'] === 0 || this.rowData['ACTION'] === 2){
        this.rowData['ACTION'] = -1;
    // a value of 1 means the row is new therefore no action needs to be taken
    } else if(this.rowData['ACTION'] === 1) {
        this.rowData['ACTION'] = -2;
    }

};

// method to append button cell to table row
StockyRow.prototype.addButtonCell = function () {

    // create new cell with parent, null data, bool determinig if header, html type, index of cell in row, pointer to row object
    new StockyCell(this.row,null,this.isHeader,'button',this.rowActiveHeaders.length+1,this);

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
function StockyTable(parent,activeHeaders,component,displayOnly){

    // assign parent jquery object
    this.tableParent = parent;

    // create table div and append to parent
    this.table       = $('<table class="table table-hover" id="'+this.tableParent+'_table" ></table>').appendTo(this.tableParent);
    // create table header div
    this.tableHeader = $('<thead id="'+idcon(this.tableParent,'h')+'"></thead>').appendTo(this.table);
    // create table body div
    this.tableBody   = $('<tbody id="'+idcon(this.tableParent,'b')+'"></tbody>').appendTo(this.table);

    // initialising header and body data
    this.headerData = null;
    this.bodyData = null;

    // array to store row objects
    this.rows = [];

    // array storing displayable column indexes
    this.activeHeaders = activeHeaders;

    // expected datatype of each column
    this.columnTypes = [];

    // boolean determining if the table is readonly or not.
    this.displayOnly = displayOnly;

    // component reference
    this.componentParent = component;

    // button control container
    this.container = undefined;

    // jquery objects storing table interaction buttons (new row and save)
    this.newRowButton = null;
    this.saveTableButton = null;

}

// initialiser for table object
StockyTable.prototype.init = function() {

    // nullify all js object data in the rows array (emptying row data)
    this.rows = [];

    // jquery method to clear all child html
    this.tableHeader.empty();
    this.tableBody.empty();

    // setting table datatypes (for validation)
    this.setColumnDataTypes();

    // adding header row to table header div
    this.addHeaderRow();

    // adding body rows to table body div
    this.addRows();

    // creating controls if table is interactive
    if(!this.displayOnly){
        this.addControls();
    }
};

// method to set data types for header
StockyTable.prototype.setColumnDataTypes = function(data) {
    // fetching current table preference object
    this.columnTypes = Stocky.getPreference(this.componentParent.dataSetReference.getPreferenceKey());

};

// function to add header row to table
StockyTable.prototype.addHeaderRow = function(){

    // creating new header row json object
    this.headerData = {};

    // return preferences object incase table is empty.
    var preferences =  this.componentParent.getPreference();

    // iterate across preferences object keys
    for(var key in preferences){
        // set value of property to key name as this is used to set the output cell text
        this.headerData[key] = key;
    }

    this.headerData['ACTION'] = 1;

    // create new row object with datatype, div parent (table body), empty data row, headers to display, bool if header row, row index, table object reference, display only bool
    new StockyRow(this.columnTypes,this.tableHeader,this.headerData,this.activeHeaders,true,0,false,this,this.displayOnly);
}

/**
 * This function will iterate across all the rows of the dataset and instantiate a row object for each row of data.
 * Differentiating the head of the table from the rows of the table with the boolean flag.
 */
StockyTable.prototype.addRows = function(){
    // loop through parent index of array (one iteration for each data row)
    for( var i = 0 ; i < this.bodyData.length ; i++ ){
        // create new row object with datatype, div parent (table body), empty data row, headers to display, bool if header row, row index, table object reference, display only bool
        this.rows.push(new StockyRow(this.columnTypes,this.tableBody,this.bodyData[i],this.activeHeaders,false,i+1,false,this,this.displayOnly));
    }
};

// method to update new body data
StockyTable.prototype.setBodyData = function(data) {

    // append action column to every row of data
    for(var row = 0 ; row < data.length ; row++){
        // default to 0 as this implies an unchanged row.
        data[row]['ACTION'] = 0;
    }

    this.bodyData = data;
};

// method ran when component receives new data from dataset
StockyTable.prototype.refresh = function() {
    // deleting row data
    this.rows = [];

    // deleting html within table
    this.tableBody.empty();

    // recreating all the row objects
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

    // create new json object
    var nullrow = {};

    // return preferences object
    var preferences =  this.componentParent.getPreference();

    // iterate across preferences object, and set column value to a default'd value to ensure it parses correctly when saved.
    for(var key in preferences){
        // default value is attained by comparing a '' input with the datatype it should be based on preference key association.
        nullrow[key] = Validation.Default(preferences[key],'',key);
    }

    nullrow['ACTION'] = 1;

    // create new row object with datatype, div parent (table body), empty data row, headers to display, bool if header row, row index, table object reference, display only bool
    this.rows.push(new StockyRow(this.columnTypes,this.tableBody,nullrow,this.activeHeaders,false,this.rows.length - 1,true,this,this.displayOnly));

    // jquery animation for UX
    $('html,body').animate({scrollTop: this.rows[this.rows.length-1].row.offset().top}, 'slow');

};

// simple method that validates then saves table data
StockyTable.prototype.saveTable = function () {
    if(this.validateTable())
        this.requestBuilder();
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
    var pref = this.componentParent.getPreference();

    // validation success state boolean
    var state = true;

    // for loop iterating across row data
    for(var row = 0 ; row <  this.rows.length ; row++) {

        // this block skips any rows that are to be deleted or havent been edited as no validation is needed.
        // this returns the value of the action column of the row.
        var actionCol = this.rows[row].rowData['ACTION'];
        if(actionCol === -1 || actionCol === -2 || actionCol === 0) continue;

        // iterate across all json objects in row data
        for(var key in this.rows[row].rowData){

            // if column is action, leave as its required at a later step.
            if(key === "ACTION"){
                continue;
            }

            // determine if column is a user accessible control by returning the index (if it exists) of the associated active header key
            var controlIndex = this.activeHeaders.indexOf(key);

            // if control is not on display validate data with default value (saves time later)
            if(controlIndex === -1){
                this.rows[row].rowData[key] = Validation.Default(pref[key],this.rows[row].rowData[key],key + 'DEFAULT');
            } else {
                // if control is on display and therefore user editable validate input and reject poorly formated input
                if(Validation.Type(pref[key],this.rows[row].rowData[key])){
                    this.rows[row].cells[controlIndex].highlight("correct");
                } else {
                    this.rows[row].cells[controlIndex].highlight("wrong");
                    state = false;
                }
            }

        }

    }
    // inform return based on success of validation
    if(!state){
        print(" > Validation Failed");
    }
    return state;
};

/**
 * This method is used to take all the newly validated table data, and build http requests based off of the action column designation:
 *
 * -2 : Do nothing (no http request needed)
 * -1 : DELETE request needed to remove row from dataset
 *  0 : Existing row that has not been altered (no change needed)
 *  1 : A row that was created new and needs a POST Request
 *  2 : An existing row that has been edited and needs a PUT request
 *
 *  Each iteraction will check the action and perform the appropriate request. append a new http request if the action
 *  required permit it. This will continually occur until all rows have been processed.
 *
 *  TODO: When global api is releases, Update method to concatenate DELETE, PUT and POST requests in discrete arrays to save on request attempts (Rate Limit Considerate Approach)
 *
 */
StockyTable.prototype.requestBuilder = function(){

    var uneditedData = [];
    var newData = [];
    var editedData = [];
    var deletedData = [];

    // loop through data in rows
    for(var row = 0 ; row < this.rows.length ; row++) {

        // store value in action column
        var action = this.rows[row].rowData['ACTION'];

        // removing the action property as its no longer necessary
        delete this.rows[row].rowData['ACTION'];

        // check if row is nonactionable (a "new" row that has been deleted does not need to edit the database)
        if (action === -2){
            continue;
        }
        // check if existing row has been deleted and therefore the database needs to be modified.
        if (action === -1) {

            deletedData.push({"id":this.rows[row].rowData["Id"]});

            // this.componentParent.requestBuilder('DELETE',this.rows[row].rowData);

            continue;
        }
        // check if row has been created and therefore the database needs to be modified.
        if (action === 1){

            newData.push(this.rows[row].rowData);

            // this.componentParent.requestBuilder('POST',this.rows[row].rowData);

            continue;
        }
        // check if row has been edited and therefore the database needs to be modified.
        if (action === 2){

            editedData.push(this.rows[row].rowData);

            // this.componentParent.requestBuilder('PUT',this.rows[row].rowData);

            continue;
        }

        // uneditedData.push(this.objectBuilder(rawData[row].rowData));

    }

    // print("Rows Unedited: ");
    // print(JSON.stringify(uneditedData, null, 4));


    if(newData.length !== 0){
        // print("Rows  Created: ");
        // print(JSON.stringify(newData, null, 4));

        this.componentParent.requestBuilder('POST',newData,true);

    }

    if(editedData.length !== 0){

        this.componentParent.requestBuilder('PUT',editedData,true);

        // print("Rows   Edited: ");
        // print(JSON.stringify(editedData, null, 4));
    }

    if(deletedData.length !== 0){

        this.componentParent.requestBuilder('DELETE',deletedData,true);

        // print("Rows  Deleted: ");
        // print(JSON.stringify(deletedData, null, 4));
    }

};

// control adding function
// TODO: Make not rubbish
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

