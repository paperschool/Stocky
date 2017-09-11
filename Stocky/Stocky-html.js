/**
 * Created by Overlord on 20/08/2017.
 */

function renderAccordionTable(accordionID,accordionTitle,tableID,tableName){

    var accordion = $('#'+accordionID).append(
        '<div class="card">' +
            '<div class="card-header" role="tab" id="heading_'+tableID+'">' +
                '<h5 class="mb-0">' +
                    '<a data-toggle="collapse" data-parent="#accordion" href="#collapse_'+tableID+'" aria-expanded="true" aria-controls="collapse_'+tableID+'">'+accordionTitle+'</a>' +
                '</h5>' +
            '</div>' +
            '<div id="collapse_'+tableID+'" class="collapse" role="tabpanel" aria-labelledby="heading_'+tableID+'">' +
                '<div class="card-block">' +
                    '<div id="'+tableID+'"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'
    );


}