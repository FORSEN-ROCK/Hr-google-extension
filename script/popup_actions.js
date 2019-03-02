/*
    This function get cookies
*/
function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

window.onload = function() {
    document.getElementById('send-id').addEventListener('click', auth);
    document.getElementById('exit-id').addEventListener('click', logOut);
    document.getElementById('my-cand-id').addEventListener('click', function() {
        chrome.runtime.sendMessage(JSON.stringify({"action": "my-candidates"}));
    });
    var token = getCookie('api_token');

    if(token != undefined){
        document.forms.authForm.hidden = true;
        document.getElementById('my-cand-id').hidden = false;
        document.getElementById('exit-id').hidden = false;
    }

    chrome.runtime.onMessage.addListener(function(requestMessage){
        if(requestMessage.action === "_auth") {
            switch(requestMessage.authStatus) {
                case "successfully":
                    authComplit();
                    break;
                case "fail":
                    authFail();
                    break;
                case "sessin_closed":
                    showAuthForm();
                    break;
            }
        }
    });
};

function authComplit() {
    document.forms.authForm.hidden = true;
    document.getElementById('my-cand-id').hidden = false;
    document.getElementById("error-message-id").hidden = true;
}

function authFail() {
    document.getElementById("error-message-id").hidden = false;
}

function auth(event) {
    /*
        Check data in this field and create http request
        for autn on recrut+
        Format - json
    */
    var authForm = document.forms.authForm;
    var myCandLink = document.getElementById('my-cand-id');
    var username = authForm.elements.username.value;
    var password = authForm.elements.password.value;

    if(username != "" && password != ""){
        var authObject = {
            "username": username,
            "password": password,
            "action": "log-in"
        };
        var httpBody = JSON.stringify(authObject);
        authForm.elements.username.classList.remove("empty");
        authForm.elements.password.classList.remove("empty");
        document.getElementById("error-empty-id").hidden = true;
        chrome.runtime.sendMessage(httpBody); 
    } else{
        if(username == "")
            authForm.elements.username.classList.add("empty");
            document.getElementById("error-empty-id").hidden = false;

        if(password == "")
            authForm.elements.password.classList.add("empty");
            document.getElementById("error-empty-id").hidden = false;
    }
}

function logOut() {
    var requestObject  = {'action': 'log-out'};
    chrome.runtime.sendMessage(JSON.stringify(requestObject));
}

function showAuthForm() {
    document.forms.authForm.hidden = false;
    document.getElementById('my-cand-id').hidden = true;
    document.getElementById('exit-id').hidden = true;
}
