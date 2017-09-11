<?php

    //setting up files;
    require_once('Pheezy/pheezy.class.php');
    // defining path variable to template folder
    define('TP','Pheezy');
    // defining path for partial folder
    define('PP',TP.'/Partial');
    // defining path for current folder

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Bookmarker</title>

    <?php include 'components/imports.php' ?>

</head>

<body>

<div class="container align-self-center">

    <br>

    <div class="card">

        <div class="card-block">

            <h4 class="card-title">Stocky Request Count</h4>
            <h6 class="card-subtitle mb-2 text-muted">A progress bar illustrating the number of requests the system can make this hour</h6>

            <div class="row">
                <div class="col-10">
                    <div class="progress">
                        <div class="progress-bar bg-info progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 25%"></div>
                        <div class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 50%"></div>
                        <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
                    </div>
                </div>
                <div class="col-2"><p>2000/4000</p></div>

            </div>
        </div>

    </div>

    <hr>

    <!-- Nav tabs -->
    <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
            <a class="nav-link active" data-toggle="tab" href="#home" role="tab">Preset Editor</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#profile" role="tab">Product Editor</a>
        </li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
        <div class="tab-pane fade show active" id="home" role="tabpanel">
            <div class="card" style="clear:both;">
                <div class="card-block">
                    <h4 class="card-title">Product Preset Editor</h4>
                    <h6 class="card-subtitle mb-2 text-muted">Create, Modify or Delete Preset Data</h6>
                    <p class="card-text">A lot of details of product creation are reusable items such as Colours, Brands or Categories. This editor allows you to add these details in advance.</p>

                    <div class="row">
                        <div class="col-6">
                            <div id="brandAccordion_1"> <script> renderAccordionTable('brandAccordion_1','Brand Editor','brandEditorTable','Brand Editor Table'); </script> </div>
                        </div>
                        <div class="col-6">
                            <div id="colourAccordion_1"> <script> renderAccordionTable('colourAccordion_1','Colour Editor','colourEditorTable','Brand Selector'); </script> </div>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col">
                            <div id="categoryAccordion_1"> <script> renderAccordionTable('categoryAccordion_1','Category Editor','categoryEditorTable','Category Selector'); </script> </div>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col">
                            <div id="debugAccordion_1"> <script> renderAccordionTable('debugAccordion_1','Debug Tools','debugTools','DEBUG TOOLS'); </script> </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>


        <div class="tab-pane fade" id="profile" role="tabpanel">
            <div class="row">
                <div class="col">

                    <div class="card" style="clear:both;">
                        <div class="card-block">
                            <h4 class="card-title">Product Matrix Builder</h4>
                            <h6 class="card-subtitle mb-2 text-muted">Build Products Quickly and Easily</h6>
                            <p class="card-text">The product builder allows you to specify a products brand, colours and size range, then the product builder will create all the product combinations for you.</p>
                            <div id="productBuilderBody"></div>
                        </div>
                        <div class="card-block">
                            <h4 class="card-title">Product from Matrix</h4>
                            <h6 class="card-subtitle mb-2 text-muted">Listing Out all Products Created Above</h6>
                            <div id="productBuilderResultBody"></div>
                        </div>
                    </div>

                </div>
            </div>

        </div>

        <footer class="footer">
            <p>&copy; 2017 STOCKY</p>
        </footer>


    </div>

    <div class="alert-chain" id="alert-chain" style="top: 20px; right: 20px; position:absolute; zIndex:4;"></div>

</div>

</body>
</html>

