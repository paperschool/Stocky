/**
 * Created by Overlord on 13/08/2017.
 */


function StockySelection(parent,key,value,index,parentReference){

    var self = this;

    self.selectorParent = parent;
    self.selectorReference = parentReference;
    self.selectorKey = key;
    self.selectorValue = value;
    self.selectorIndex = index;

    self.filterValue = null;

    self.selection = null;

    self.renderSelection();

}

StockySelection.prototype.deleteSelection = function () {

    this.selection.remove();

}

StockySelection.prototype.renderSelection = function () {

    var self = this;

    self.selection = $(
            '<tr id="'+idcon(self.selectorParent.attr('id'),'r',self.selectorIndex)+'">' +
            '<td id="'+idcon(self.selectorParent.attr('id'),'c',0)+'">'+self.selectorValue+'</td>' +
            '</tr>'
                    )
        .effect("highlight", { color: '#2ecc71' }, 500)
        .appendTo(self.selectorParent);


    self.selection.click(function () {
       console.log("Selection Clicked..." + self.selectorKey + " : " + self.selectorValue + " @ " + self.selectorIndex);
        self.selectorReference.selectedIndex = self.selectorIndex;
    });

};

function StockySelector(parent,keyValAssociation){

    var self = this;

    self.selectorParent = parent;
    self.selector      = $('<table class="table table-hover" id="'+self.selectorParent+'_selector" ></table>').appendTo(self.selectorParent);
    self.selectorBody  = $('<tbody id="'+idcon(this.selectorParent,'b')+'"></tbody>').appendTo(self.selector);

    self.bodyData = null;

    self.selectors = [];
    self.keyValAssociation = keyValAssociation;

    self.selectedIndex = null;

}

StockySelector.prototype.getSelectedData = function(){
    return this.bodyData[this.selectedIndex];
};

StockySelector.prototype.setBodyData = function(data){
    this.bodyData = this.ExtractUnique(data);
};

StockySelector.prototype.ExtractUnique = function () {

};

StockySelector.prototype.init = function(){
    this.selectorBody.empty();
    this.selectors = [];
    this.addSelectors();
};

StockySelector.prototype.addSelectors = function(){

    for(var selector = 0 ; selector < this.bodyData.length ; selector++){

        // skip rendering this row if both a filter value is set (!== null) and if the data stored in the current row at
        // the filter objects 'header' column index is not the same as the data stored in the filter objects 'value' value.
        if(typeof this.filterValue !== 'undefined'){
            if(this.bodyData[selector][this.filterValue['header']] !== this.filterValue['header']){
                continue;
            }
        }

        this.selectors.push(new StockySelection(this.selectorBody,this.bodyData[selector][this.keyValAssociation[0]],this.bodyData[selector][this.keyValAssociation[1]],selector,this))

    }

};

StockySelector.prototype.setFilter = function(filterHeader, filterValue){

    this.filterValue = {"header":filterHeader,"value":filterValue};

};

StockySelector.prototype.applyFilter = function () {
    for(var selector = this.selectors.length - 1 ; selector > 0 ; selector--){
        if(this.selectors[selector][this.filterValue['header']] !== this.filterValue['value']){
            this.selector[selector].deleteSelection();
            this.selectors.splice(selector,1);
        }
    }
}
