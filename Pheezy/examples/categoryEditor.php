<?php

// php for colour editor

$categoryTable1 =  new Pheezy('components/table.template.php');
$categoryTable1->assignMultiple(array(
    'get_request'=>'"https://api.eposnowhq.com/api/v2/Category"',
    'table_id' => 'categoryEditorTable1',
    'active_rows'=>'1,2,4,5',
    'preferences_key'=>'CATEGORY',
));
$categoryTable1->parse(false);

$categoryAccordion = new Pheezy('components/accordion.template.php');
$categoryAccordion->assignMultiple(array('accordion_index' => 'categoryEditor','accordion_title' => 'Category Editor'));
$categoryAccordion->inner('body_accordion',array($categoryTable1));
$categoryAccordion->show(false);

?>

