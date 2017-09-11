<div id="{TABLE_ID}"></div>

<div class="button-box col-lg-12">

    <button type="button" onclick="tbl{TABLE_ID}.getComponent().addData();" class="btn btn-outline-info">New</button>

<button type="button" onclick="tbl{TABLE_ID}.getComponent().saveTable();" class="btn btn-outline-success">Save</button>

</div>

<script>
    var tbl{TABLE_ID} = new StockyComponent("{TABLE_ID}",{GET_REQUEST},[{ACTIVE_ROWS}],'table',"{PREFERENCES_KEY}");

    Stocky.registerComponent(tbl{TABLE_ID});

</script>