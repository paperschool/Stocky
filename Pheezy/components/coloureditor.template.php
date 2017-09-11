<form id="form">
    <div class="row align-items-start">
        <?php

            $colourNameInput =  new Pheezy('components/input.template.php');
            $colourNameInput->assignMultiple(array('LABEL_TEXT' => 'Colour Name','INPUT_ID' => 'colourEditorName'));
            $colourNameInput->show(false);

            ?>
        <div class="col">
            <div class="form-group">
                <label id="submit-label">_</label>
                <button id="new-brand" type="submit" class="form-control btn btn-primary " >Submit</button>
            </div>
        </div>
    </div>
</form>