/**
 * Created by Overlord on 10/09/2017.
 */


function createDebugButtons(BrandDataSet,ColourDataSet,CategoryDataSet,LocationDataSet,ProductDataSet,StockDataSet){


    // ONLY FOR TESTING...

    var productdata = null;

    ProductDataSet.registerSimpleComponent(new StockyButton($('#debugTools'),"DELETE ALL PRODUCTS","danger",
        (function(){

            console.log(productdata);

            for(var row = 0 ; row < productdata.length ; row++){
                ProductDataSet.appendRequest("DELETE",{"ProductID":productdata[row][0]},true);
            }

        }).bind(this),null,null),store);

    function store(head,body){
        productdata = body;
    }

    LocationDataSet.registerComponent(new StockyComponent($('#debugTools'),null,[0,2],'table'));


    ////////////////////////////////////////////////////////////////////////////////////



}

