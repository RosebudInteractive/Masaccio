/**
 * Created by staloverov on 07.10.2015.
 */

function ProcessInfo(ProcessID){
    this.processID = ProcessID;
    this.instance = null;

    this.instanceExists = function(){
        return (this.instance)
    };

    this.isProcessFinished = function() {
        return this.instanceExists() && this.instance.isFinished()
    }
};

if (module) {module.exports = ProcessInfo}
