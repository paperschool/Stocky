<div class="card">
    <div class="card-header" role="tab" id="heading_{ACCORDION_INDEX}">
        <h5 class="mb-0">
            <a data-toggle="collapse" data-parent="#accordion" href="#collapse_{ACCORDION_INDEX}" aria-expanded="true" aria-controls="collapse_{ACCORDION_INDEX}">
                {ACCORDION_TITLE}
            </a>
        </h5>
    </div>
    <div id="collapse_{ACCORDION_INDEX}" class="collapse" role="tabpanel" aria-labelledby="heading_{ACCORDION_INDEX}">
        <div class="card-block" style="overflow: auto">
            {{BODY_ACCORDION}}
        </div>
    </div>
</div>
