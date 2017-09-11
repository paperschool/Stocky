/**
 * Created by Overlord on 11/08/2017.
 */

var attemptCap = 1;

var errors = false;

var pendingRequests = [];

var remainingRequests = 0;

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
            attemptCap = msg.data['preference']['attempt-cap'];
            requestDelay = msg.data['preference']['request-delay'];
            break;
    }
};

function append(content){

    // console.log("New '" + content['type'] + "' Job Appended..." + content['RequestID']);
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

    if(remainingRequests <= 0) {
        workerRunning = false;
        return;
    }

    // if current job has exceed the max number of attempts the job is allowed to make
    if(pendingRequests[0]['Attempts'] > attemptCap - 1){
        // kicking the job if the above case it met
        kickBadRequest();
        return;
    } else {
        // this checks if the head of the queue is a get request and is not the only request left,
        // this is done so get requests occur only after any modifications are performed to the dataset
        // as to avoid redundant gets.
        if(pendingRequests[0]['type'] === 'GET' && remainingRequests > 1) {
            pushBackJob();
            return;
        }
        // otherwise run request
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

    if(type !== 'GET' && remainingRequests === 0){
        self.postMessage({"type":type,'payload':1});
    }
}

function kickBadRequest(){
    console.log(" X KICKING JOB ID: " + pendingRequests[0]['RequestID'] + ", ATTEMPTS: " + pendingRequests[0]['Attempts']);
    self.postMessage({"type":pendingRequests[0]['type'],'payload':0,'error':''});
    pendingRequests.splice(0, 1);
    remainingRequests--;

}



var ajax = function(request) {

    var self = this;

    var req = new XMLHttpRequest();

    req.open(request['type'], request['url'], false);

    req.setRequestHeader('Authorization', request['Authorization']);

    req.setRequestHeader("Content-type", "application/json");
    // req.setRequestHeader('Content-Type', 'text/plain; charset="utf-8"');

    req.onreadystatechange = function() {

        if (req.readyState === 4 && !(req.status === 200 || req.status === 201)) {
            console.log(" > JOB FAILED - TYPE: '" + request['type'] + "', JOB ID: " + request['RequestID'] + ", ATTEMPTS: " + request['Attempts']);
            self.postMessage({"type":request['type'],'payload':0,'error':JSON.stringify(req.responseText)});
            pushBackJob();
        }
        if (req.readyState === 4 && (req.status === 200 || req.status === 201)) {

            console.log(" > JOB COMPLETED: " + request['type'] + " : JOB ID " + request['RequestID'] );

            if(request['type'] === 'GET'){
                self.postMessage({"type":request['type'],'payload':JSON.parse(req.responseText)});
            }

            popJob(request['type']);

        }
    };

    try {
        pendingRequests[0]['Attempts'] += 1;

        if(request['type'] === 'GET'){
            req.send(null);
        } else {
            req.send(request['payload']);
        }


    }
    catch(err) {
        return;
    }

    return req;
};
