/*
    This file is center of work with back-end
    He get all message from extension scripts and 
    Resend between  components and Recrut+
*/
/*
    Function - listener event onclick on menu item
*/
function tester(info, tab){
    //console.log('Send message');
    var token = getCookie('api_token');

    if(token != undefined){
        chrome.tabs.query({ "active": true,"currentWindow": true }, function (tabs) {        
            chrome.tabs.sendMessage(tabs[0].id, {action: '_getContent'});
        });
    } else{
        alert("Для начала работы необходимо авторизоваться!");
    }
}
/*
*/
function closedBackground(event) {
    alert("Окно будет закрыто!");
    //window.close();
}
/*
    create context menu item

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({"title": "Сохранить в системе", "contexts": ["page"], "id": "test", "onclick": tester});
});
*/
chrome.contextMenus.create({"title": "Сохранить в системе", "contexts": ["page"], "id": "test", "onclick": tester});
/*
    function setting cookies
*/
function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}
/*
    This function getting cookies
*/
function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
/*
    This function remove cookies auth
*/
function deleteCookie(name) {
  setCookie(name, "", {
    expires: -1
  })
}
/*
    This function getting api token or raise exception auth

function getToken() {
    var token = getCookie('api_token');

    if(token != undefined) {
    } else {
    }
}*/
/*
    Add listener for input message from content scripts
    This listener rout inbound actions
*/
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(JSON.parse(request));
        try {
            switch(JSON.parse(request).action) {
                case "parse":
                    parseResume(request);
                    break;
                case "save":
                    saveResume(request);
                    break;
                case "log-in":
                    authInRecrut(request);
                    break;
                case "load":
                    loadResumes();
                    break;
                case "my-candidates":
                    myCandidates();
                    break;
                case "close-my-candidates":
                    myCandidatesClose();
                    break;
                case "log-out":
                    logOut();
                    break;
            }
        } catch (eer) {
            console.log(request);
        }
    }
);
/*
    This function send message to Recrut+ for parse resume
    Takes content in format JSON with source data and actions
    Result is open parser window and send message to Recrut+
*/
function parseResume(content) {
    var token = getCookie('api_token');
    var parserId;
        //console.log(content);
    apiRequest = new XMLHttpRequest();
    apiRequest.open('POST', '<api-url>', true);
    apiRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    apiRequest.setRequestHeader('Authorization', 'Token ' + token);
    apiRequest.onload = function() {
        chrome.tabs.sendMessage(parserId, apiRequest.responseText);
        //console.log(apiRequest.responseText);
        //console.log(tab.id);
    };
    apiRequest.timeout = 10000;
    apiRequest.ontimeout = function() {
        alert("Sorry, time is over");
    }
    apiRequest.send(content);
    chrome.tabs.create({'url': 'parser.html', 'active': true}, function(tab){
        parserId = tab.id;
    });
}
/*
    This function send message to Recrut+ for save resume in Siebel
    Takes resume data from parse window in format JSON with data and action
    Result is send message to Recrut+ and open or reload "My Candidate" window
*/
function saveResume(content) {
    var apiRequest = new XMLHttpRequest();
    var token = getCookie('api_token');
    apiRequest.open('POST', '<api-url>', true);
    apiRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    apiRequest.setRequestHeader('Authorization', 'Token ' + token);
    apiRequest.onload = function() {
        console.log(apiRequest.responseText);
        var response = JSON.parse(apiRequest.responseText);
        var message = "";
        var fullName = "";

        switch(response.status_text) {
            case "candidate_save":
                message = "Кандидат успешно сохранен:";
                break;
            case "candidate_find":
                message = "Данные кандидата были обновлены:";
                break;
            default:
                message = "Произошла ошибка";
        }

        if(response.resume.first_name != null && response.resume.last_name !=null)
            fullName = response.resume.last_name + ' ' + response.resume.first_name;
        else
            fullName = response.resume.out_id;

        chrome.notifications.create('reminder', {
            type: 'basic',
            iconUrl: 'logo_128.png',
            title: "Статус загрузки",
            message: message + '\n' + fullName
        }, function(notificationId) {});
    };
    apiRequest.send(content);
}
chrome.notifications.onClicked.addListener(function() {
    var backgroundTabId = sessionStorage.getItem("background_tab");

    //console.log(backgroundTabId);
    if(backgroundTabId == null){
        chrome.tabs.create({'url': 'my_candidates.html', 'active': true}, function(tab){
            sessionStorage.setItem("background_tab", tab.id);
        }); 
    } else
        chrome.tabs.update(Number(backgroundTabId), {'url': 'my_candidates.html', 'active': true});
});
/*
    This function is auth in Recrut+
    Takes credentials in JSON format with action 
*/
function authInRecrut(content) {
    var apiRequest = new XMLHttpRequest();
    var authStatus = "";
    var responseMessage = {
        action: "_auth"
    };

    apiRequest.open("POST", '<auth-url>', true);
    apiRequest.setRequestHeader('Content-Type', 'application/json');
    apiRequest.onload = function() {
        if(apiRequest.status === 200) {
            var responce = JSON.parse(apiRequest.responseText);
            // valid status, satus_responses == 'successfully' and them 
            setCookie('api_token', responce['token'], {expires: 604800});
            authStatus = "successfully";
            // send message to popup with result
        } else {
            authStatus = "fail"
        }
        responseMessage.authStatus = authStatus;
        chrome.runtime.sendMessage(responseMessage);
        
    };
    apiRequest.send(content);
}
/**/
function logOut() {
    deleteCookie("api_token");
    chrome.runtime.sendMessage({'action': 'sessin_closed'});
}
function test_() {
    chrome.tabs.create({'url': 'parser.html', 'active': true});
}    
/**/
function loadResumes() {
    var token = getCookie('api_token');
    apiRequest = new XMLHttpRequest();
    apiRequest.open('GET', "<api-url>", true);
    apiRequest.setRequestHeader('Authorization', 'Token ' + token);
    apiRequest.onload = function() {
        //console.log(apiRequest.responseText);
        //reateRecords(JSON.parse(apiRequest.responseText));
        //console.log(apiRequest.responseText);
        chrome.runtime.sendMessage(apiRequest.responseText);
    };
    apiRequest.timeout = 10000;
    apiRequest.ontimeout = function() {
        alert("Sorry, time is over");
    }
    apiRequest.send();
}

function myCandidates() {
    var backgroundTabId = sessionStorage.getItem("background_tab");

    //console.log(backgroundTabId);
    if(backgroundTabId == null){
        chrome.tabs.create({'url': 'my_candidates.html', 'active': true}, function(tab){
            sessionStorage.setItem("background_tab", tab.id);
        }); 
    } else
        chrome.tabs.update(Number(backgroundTabId), {'url': 'my_candidates.html', 'active': true});
}

function myCandidatesClose() {
    sessionStorage.removeItem("background_tab");
}