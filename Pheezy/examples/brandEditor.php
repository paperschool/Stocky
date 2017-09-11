
<?php

        // php for colour editor

        $brandTable =  new Pheezy('components/table.template.php');

        $brandTable->assignMultiple(array(
            'get_request'=>'"https://api.eposnowhq.com/api/v2/Brand"',
            'table_id' => 'brandEditor',
            'active_rows'=>'0,1,2',
            'preferences_key'=>'BRAND',
        ));

        $brandTable->parse(false);

        $brandForm =  new Pheezy('components/brandeditor.template.php');
        $brandForm->assignMultiple();
        $brandForm->parse(false);

        $brandAccordion = new Pheezy('components/accordion.template.php');
        $brandAccordion->assignMultiple(array('accordion_index' => 'brandEditor','accordion_title' => 'Brand Editor'));
        $brandAccordion->inner('body_accordion',array($brandTable));
        $brandAccordion->show(false);

?>

