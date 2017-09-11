<?php

/**
 * Author - Dominic Jomaa 05/08/2017
 *
 * Class Pheezy
 * Syntax:
 * 1 - {VARIABLE} - with this syntax the class parser will identify this space for dynamic usage, for example
 *                we may declare a content called "name_program" and associate that with Pheezy. This will then
 *                insert the string Pheezy into any HTML reading {NAME_PROGRAM}
 * 2 - [VARIABLE] - with this syntax the class parser will identify this space for dynamic usage, for example
 *                we may insert a subtype template and than pass in an array of data with key value pairs from
 *                that sub template
 * 3 - {{VARIABLE}} - with this syntax the class will take another template object and insert the html created within
 *                  that object and insert it into the spaces with this string match.
 *
 */

class Pheezy
{

    // define array to store element contents
    private $assignedValues = array();

    // define variable to store partial information
    private $partialBuffer;

    // define variable to store template file for modification and output
    private $tpl;

    // define variable to store template file post modification
    private $tplParsed;

    // constructor function that takes the path to the template we want to use
    function __construct($_path = ''){

        // initial validation to check if path variable is empty
        if(!empty($_path))
        {
            // check if file exists using path 
            if(file_exists($_path)){

                ob_start();
                include $_path;
                $this->tpl = ob_get_clean();

                // assigning path to tpl variable.
//                $this->tpl = file_get_contents($_path);

                $this->tplParsed =  $this->tpl;
            } else {
                echo "<b>Template</b> Error: File '{$_path}' Inclusion Error.<br>";
            }
        } else {
            echo "<b>Template</b> Error: File Path Empty.<br>";
        }
    }

    // TODO: function that will inadvance fill template info with default content
    // (parsing exercise)
    function assignDefault(){
        // for each loop to iterate across assigned variable list
        forEach($this->assignedValues as $key => $value){
            $this->tpl = str_replace('{'.$key.'}',$value,$this->tpl);
        }
    }


    // function to assign content to variables found in the template file.
    function assign($_searchString,$_replaceString = ''){
        // checking if template variable is empty
        if(!empty($_searchString)){
            // if not empty, then an array index is created where the index is the search
            // string and the value is the replace string.
            $this->assignedValues[strtoupper($_searchString)] = $_replaceString;
        } else {
            // error out
            echo "<b>Assign</b> Error: search string empty.<br>";
        }
    }

    // function to assign content to variables found in the template file.
    function assignMultiple($_replaceString = array()){

        // check if key value array length is 0
        if(count($_replaceString) > 0){
            // iterate across assigned values array
            foreach ($_replaceString as $key => $value){
                $this->assign($key, $value);
            }
        }
    }

    // function to render out partial files, by parsing the given array of assigned values, and
    // iterating across the key value pairs in the array, replacing key variable elements
    // with value content and returning this new template.
    function renderPartial($_searchString,$_path,$_assignedValues = array()){

        // check if parent variable string is empty
        if(!empty($_searchString)){
            // check if path for partial file exists
            if(file_exists($_path)){
                // assign partial buffer to template file.
                $this->partialBuffer = file_get_contents($_path);

                // check if key value array length is 0
                if(count($_assignedValues) > 0){
                    // iterate across assigned values array
                    foreach ($_assignedValues as $key => $value){

                        // replace partial buffer where variable key is found "{VAR}" and replace this with value
                        $this->partialBuffer = str_replace('{'.strtoupper($key).'}',$value,$this->partialBuffer);
                    }
                }

                // replace parent template with new parsed partial template html
                $this->tpl = str_replace('['.strtoupper($_searchString).']',$this->partialBuffer,$this->tpl);
                // reset partialBuffer
                $this->partialBuffer = '';
            } else {
                // error out
                echo "<b>Partial Template Error</b> Error: Partial '{$_path}' Inclusion empty.<br>";
            }
        }
    }

    function parse($_debug = false){

        // checking if array is 0 to skip processing
        if(count($this->assignedValues) > 0) {
            // for each loop to iterate across assigned variable list
            forEach ($this->assignedValues as $key => $value) {
                $this->tplParsed = str_replace('{' . $key . '}', $value, $this->tplParsed);
            }
            if ($_debug) {
                $this->tplParsed .= '<!--' . date('d.m.y H:i:s') . '-->';
            }

        }
    }

    // function ran when template variables have been filled, the function will
    // parse entire template file string matching any given variables and replacing the
    // variable with the associated assigned variable array value
    function show($_debug = false){
        $this->parse($_debug);
        echo $this->tplParsed;
    }

    // This function is designed to take an array of already parsed templates and place them
    // anywhere in the current template object that matches the string match {{VAR_NAME}}
    function inner($_searchString,$_templateInner){

        $innerStack = "";

        if(empty($_searchString)){
            // error out
            echo "<b>Inner Template Error</b> Error: Inner Inclusion search string empty.<br>";
        }
        if(!count($_templateInner) > 0){
            echo "<b>Inner Template Error</b> Error: Inner Inclusion array empty.<br>";
            return;
        }
        forEach ($_templateInner as $value) {
            if(!empty($value->tplParsed) or strlen($value->tplParsed) == 0){
                // search for replace variable and insert html
                $innerStack .= $value->tplParsed;
            } else {
                // error out
                echo "<b>Inner Template Error</b> Error: Inner Inclusion empty.<br>";
            }
        }
        $this->tplParsed = str_replace('{{'.strtoupper($_searchString).'}}',$innerStack,$this->tplParsed);
    }


    function dump($_varToDump){

        if(!empty($_varToDump)){
            var_dump($_varToDump);
        } else {
            var_dump($this->tplParsed);
        }
    }

    function size($_varToDump){

        if(!empty($_varToDump)){
            var_dump(strlen($_varToDump));
        } else {
            var_dump(strlen($this->tplParsed));
        }
    }

}

?>