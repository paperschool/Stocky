/**
 * Created by Overlord on 11/08/2017.
 */

var workerName = "";

var attemptCap = 1;

var errors = false;

var pendingRequests = [];

var remainingRequests = 0;

// this is true when getting (requiring potentially multiple pages of the api dataset
var paging = false;
// place to store collective data from paging process
var pageDump = [];
// current page index;
var pageIndex = 1;

var idleDelay    = 10;

var requestDelay = 200;

var workerRunning = false;

// simple request id (using basic incrementation)
var RequestID = 0;

self.onmessage = function(msg){

    // console.log(msg.data);

    switch(msg.data['message']){
        case 'append': append(msg.data['content']); break;
        case 'preference':
            workerName = msg.data['preference']['worker-name'];
            attemptCap = msg.data['preference']['attempt-cap'];
            requestDelay = msg.data['preference']['request-delay'];
            break;
    }
};

function append(content){

    // console.log("New '" + content['type'] + "' Job Appended..." + content['RequestID']);

    // adding a page parameter to the object for better tracking of jobs on output
    if(content['type'] === "GET"){
        content['page'] = pageIndex;
    }

    pendingRequests.push(content);
    remainingRequests++;

    if(!workerRunning){
        workerRunning = true;
        startWorker();
    }
}

function startWorker(){
    setInterval(function(){
        if(workerRunning){
            attemptRequests()
        }
    },(workerRunning ? requestDelay : idleDelay));
}

function attemptRequests() {

    // check if there are no remaining jobs to be completed (idle thread);
    if(remainingRequests <= 0) {
        workerRunning = false;
        return;
    }

    // if current job has exceed the max number of attempts the job is allowed to make
    if(pendingRequests[0]['Attempts'] > attemptCap - 1){
        // kicking the job if the above case it met
        kickBadRequest();
        // return to restart check steps in loop
        return;
    } else {
        // this checks if the head of the queue is a get request and is not the only request left,
        // this is done so get requests occur only after any modifications are performed to the dataset
        // as to avoid redundant get requests.
        if(pendingRequests[0]['type'] === 'GET' && remainingRequests > 1) {
            pushBackJob();
            ResetGetRequest()
            // return to restart check steps in loop
            return;
        } else if(pendingRequests[0]['type'] === 'GET'){
            paging = true;
            // otherwise run request
        }

        ajax(pendingRequests[0]);

    }

}

// function that relocates job at front of queue to back of queue
function pushBackJob(){
    var resetRequest = self.pendingRequests[0];
    self.pendingRequests.splice(0, 1);
    self.pendingRequests.push(resetRequest);
}

// function that removes job from the front of the queue
function popJob(type){

    remainingRequests--;
    self.pendingRequests.splice(0, 1);
    self.remainingRequests = self.pendingRequests.length;

    // if jobs finish and don't end on a get request
    if(type !== 'GET' && remainingRequests === 0){
        self.postMessage({"type":type,'payload':1});
    }
}

function popJobGet(payload) {

    if (payload.length === 0) {
        self.postMessage({"type": "GET", 'payload': pageDump});
        ResetGetRequest()
        popJob("GET");
    } else {
        // concatenate current get dump with new page data and store locally
        pageDump = pageDump.concat(payload);
        paging = true;
        pageIndex++;
        pendingRequests[0]['page'] = pageIndex;

    }

}

function ResetGetRequest(){
    paging = false
    pageDump = [];
    pageIndex = 1;
}

function kickBadRequest(){
    console.log(workerName + " Thread : X KICKING JOB ID: " + pendingRequests[0]['RequestID'] + ", ATTEMPTS: " + pendingRequests[0]['Attempts']);
    if(pendingRequests[0]['type'] === "Get"){
        ResetGetRequest()
    }

    self.postMessage({"type":pendingRequests[0]['type'],'payload':0,'error':''});
    pendingRequests.splice(0, 1);
    remainingRequests--;



}

function modifyRequestLine(line,type){

    if(type === 'GET'){
        line = line + "?page=" + pageIndex;
        // behavour to append search queries is done here
    } else {
        // line = line + "?page=" + pageIndex;
    }

    return line;
}

var ajax = function(request) {

    var self = this;

    var req = new XMLHttpRequest();

    // function will check if request is get, if true it will return a new request line with the page parameter
    // and page index included, otherwise it will simply use the original line
    req.open(request['type'], modifyRequestLine(request['url'],request['type']), false);

    req.setRequestHeader('Authorization', request['Authorization']);

    req.setRequestHeader("Content-type", "application/json");
    // req.setRequestHeader('Content-Type', 'text/plain; charset="utf-8"');

    req.onreadystatechange = function() {

        var output = {}

        output['THREAD']   = workerName;
        output['JOB TYPE'] = request['type'];
        output['JOB ID']   = request['RequestID'];
        output['ATTEMPTS'] = request['Attempts'];

        if (req.readyState === 4 && !(req.status === 200 || req.status === 201 || req.status === 204)) {

            pendingRequests[0]['Attempts'] += 1;

            output['JOB OUTCOME'] = "FAILED";
            output['URI'] = modifyRequestLine(request['url'],request['type']);
            console.log(output);


            self.postMessage({"type":request['type'],'payload':0,'error':JSON.stringify(req.responseText)});
            pushBackJob();
        }
        if (req.readyState === 4 && (req.status === 200 || req.status === 201 || req.status === 204)) {

            output['JOB OUTCOME'] = "SUCCESS";

            if(request['type'] === 'GET'){

                output['URI'] = modifyRequestLine(request['url'],request['type']);
                console.log(output);

                popJobGet(JSON.parse(req.responseText));
            } else {

                output['URI'] = request['url'];
                console.log(output);

                popJob(request['type']);
            }

        }
    };

    req.onerror = function(e) {
        alert("Error Status: " + e.target.status);
    };

    try {

        if(request['type'] === 'GET'){
            req.send(null);
        } else {
            req.send(request['payload']);
        }


    }
    catch(err) {
        pendingRequests[0]['Attempts'] += 1;
        return;
    }

    return req;
};
