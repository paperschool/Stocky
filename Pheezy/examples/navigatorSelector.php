<?php

$navigationBrandSelector =  new Pheezy('components/selector.template.php');
$navigationBrandSelector->assignMultiple(array(
    'get_request'=>'"https://api.eposnowhq.com/api/v2/Brand"',
    'selector_id' => 'navigationBrandSelector',
    'active_rows'=>'0,1',
    'selector_filter'=>"{'header':'BrandID','value','12345'}"));

$navigationBrandSelector->parse(false);

$navigationAccordion = new Pheezy('components/accordion.template.php');
$navigationAccordion->assignMultiple(array('accordion_index' => 'navigation','accordion_title' => 'Product Navigation'));
$navigationAccordion->inner('body_accordion',array($navigationBrandSelector));
$navigationAccordion->show(false);

?>