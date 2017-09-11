<form id="form">
    <div class="row align-items-start">
        <?php

            $brandNameInput =  new Pheezy('components/input.template.php');
            $brandNameInput->assignMultiple(array('LABEL_TEXT' => 'Brand Name','INPUT_ID' => 'brandEditorName'));
            $brandNameInput->show(false);

            $brandDescriptionInput =  new Pheezy('components/input.template.php');
            $brandDescriptionInput->assignMultiple(array('LABEL_TEXT' => 'Brand Description','INPUT_ID' => 'brandEditorDescription'));
            $brandDescriptionInput->show(false);

            ?>
        <div class="col">
            <div class="form-group">
                <label id="submit-label">_</label>
                <button id="new-brand" type="submit" class="form-control btn btn-primary " >Submit</button>
            </div>
        </div>
    </div>
</form>