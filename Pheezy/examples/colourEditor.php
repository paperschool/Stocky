
<?php

// php for colour editor

$colourTable =  new Pheezy('components/table.template.php');
$colourTable->assignMultiple(array(
    'get_request'=>'"https://api.eposnowhq.com/api/v2/Colour"',
    'table_id' => 'colourEditorTable',
    'active_rows'=>'0,1,2',
    'preferences_key'=>'COLOUR',
));
$colourTable->parse(false);

$colourAccordion = new Pheezy('components/accordion.template.php');
$colourAccordion->assignMultiple(array('accordion_index' => 'colourEditor','accordion_title' => 'Colour Editor'));
$colourAccordion->inner('body_accordion',array($colourTable));
$colourAccordion->show(false);

?>
