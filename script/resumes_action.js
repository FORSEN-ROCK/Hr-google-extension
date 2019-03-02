document.addEventListener("DOMContentLoaded", loadResumes);

function loadResumes() {
    chrome.storage.sync.get('recrut_token', function(result){
        var token = result.recrut_token;
        console.log(request);
        apiRequest = new XMLHttpRequest();
        apiRequest.open('POST', '<api-resume-url>', true);
        apiRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        apiRequest.setRequestHeader('Authorization', 'Token ' + token);
        apiRequest.onload = function() {
            console.log(apiRequest.responseText);
        };
        apiRequest.timeout = 10000;
        apiRequest.ontimeout = function() {
            alert("Sorry, time is over");
        }
        apiRequest.send(request);
    });
}