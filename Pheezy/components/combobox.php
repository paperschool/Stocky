<?php
/**
 * Created by PhpStorm.
 * User: Overlord
 * Date: 04/08/2017
 * Time: 17:28
 */?>

<head>
    <link href="content/c_9/css/bootstrap-combobox.css" rel="stylesheet">

    <script src="content/c_9/js/bootstrap-combobox.js"></script>

</head>

<div class="col-xs-6">
    <div class="well well-lg">
        <label>Brand Name: </label>
        <select class="combobox">
            <option></option>
            <option value="PA">Pennsylvania</option>
            <option value="CT">Connecticut</option>
            <option value="NY">New York</option>
            <option value="MD">Maryland</option>
            <option value="VA">Virginia</option>
        </select>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function(){
        $('.combobox').combobox();
    });
</script>