/**
 * Created by Overlord on 11/08/2017.
 */

function StockyRequestQueue(parent,title,attemptCap,requestDelay) {

    this.parentComponent = parent;

    this.pendingRequests = [];
    this.remainingRequests = 0;

    this.title = title;

    this.requestDelay = requestDelay;

    this.attemptCap = attemptCap;

    // simple request id (using basic incrementation)
    this.RequestID = 0;

    if (typeof(this.worker) === "undefined") {
        this.worker = new Worker("/Stocky/Stocky-request-queue-worker.js");
    }

    this.setupWorker();

}

StockyRequestQueue.prototype.setupWorker = function () {
    var newReq = {"message":"preference",
        "preference":{
            "worker-name":this.title,
            "attempt-cap":this.attemptCap,
            "request-delay":this.requestDelay
        }
    };

    this.worker.postMessage(newReq);

    var self = this;

    this.worker.addEventListener('message', (function (msg) {

        switch(msg.data['type']){

            case 'POST'   :
            case 'PUT'    :
            case 'DELETE' :
                msg.data['payload'] === 1 ? this.parentComponent.init() : this.parentComponent.fail(msg.data['type'],msg.data['error']);
                break;
            case 'GET' :
                msg.data['payload'] === 0 ? this.parentComponent.fail(msg.data['type'],msg.data['error']) : this.parentComponent.refreshData(msg.data['payload']);
                break;
        }

    }).bind(this));


};

StockyRequestQueue.prototype.append = function(http,type,payload){

    var self = this;

    var newReq = {"message":"append",
                  "content":{
                    "Attempts":0,
                    "RequestID":self.RequestID++,
                    "type":type,
                    "url":http,
                    "payload":payload,
                    "Authorization":"Basic "+Authentication.getAccessToken()
                  },
                  "preference":{
                    "attempt-cap":this.attemptCap
                  }
                };

    this.worker.postMessage(newReq);

};
