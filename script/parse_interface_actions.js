document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("span-title-id").addEventListener("focus", interfaceCliced);
    document.getElementById("input-title-id").addEventListener("blur", interfaceOutFocus);
    document.getElementById("vacancy-id").addEventListener("dblclick", selectedVacancy);
    document.getElementById("choices-id").addEventListener("dblclick", deletedVacancy);
    document.getElementById("button-save-id").addEventListener("click", saveResume);
    createOpenVacancy();
    document.getElementById("vacancy-search-id").addEventListener("keyup", searchVacancy);
});

chrome.extension.onMessage.addListener(function(requestMessage) {
    console.log(requestMessage);
    console.log(JSON.parse(requestMessage));
    fillingParserForm(JSON.parse(requestMessage).resume)
});

function interfaceCliced(event){
    var target = event.target;

    if(target.tagName == "SPAN" && target.id == "span-title-id"){
        var titleSpan = document.getElementById('span-title-id');
        var titleInput = document.getElementById('input-title-id');

        titleInput.value = titleSpan.innerHTML;
        titleSpan.style.display = "none";
        titleInput.style.display = "block";
        titleInput.focus();
    }
};

function interfaceOutFocus(event){
    var target = event.target;
    console.log(event);
    if(target.tagName == "INPUT" && target.name == "resume-title"){
        var titleSpan = document.getElementById('span-title-id');
        var titleInput = document.getElementById('input-title-id');

        titleSpan.innerHTML = titleInput.value;
        titleSpan.style.display = "block";
        titleInput.style.display = "none";
    }
};

function fillingParserForm(resume) {
    var form = document.forms.resume;
    var experience = resume.experience;
    var education = resume.education;
    var experienceSection = document.getElementById("experience-id");
    var educationSection = document.getElementById("education-id");
    var resumePreView = document.getElementById("pre-view-id");

    document.getElementById("span-title-id").innerHTML = resume.title;

    form['resume-title'].value = resume.title;
    form['resume_id'].value = resume.resume_id;
    form['first_name'].value = resume.first_name;
    form['last_name'].value = resume.last_name;
    form['middle_name'].value = resume.middle_name;
    form['birthday'].value = resume.birthday;
    form['sex'].value = resume.gender;
    form['city'].value = resume.city;
    form['phone'].value = resume.phone;
    form['email'].value = resume.email;
    form['having_car'].value = resume.having_car;
    form['education'].value = resume.degree_of_education;
    form['length-of-work'].value = resume.length_of_work;

    resumePreView.src = resume.resume_file;

    /*
        Filling experience block
    */
    for(var i=0; i < experience.length; i++){
        var experienceBlock = document.createElement('div');
        var period = document.createElement('div');
        var experienceInfo = document.createElement('div');
        period.classList.add("left");
        //experienceInfo.classList.add("right");
        experienceBlock.classList.add('block');
        period.innerHTML = '<p>' + experience[i].experience_time_interval + '</p>';
        period.innerHTML += '<p>' + experience[i].experience_period + '</p>';
        experienceInfo.innerHTML = '<p>' + experience[i].organization_name + '</p>';
        experienceInfo.innerHTML += '<p>' + experience[i].last_position + '</p>';
        experienceInfo.innerHTML += '<p>' + experience[i].experience_text + '</p>';
        experienceBlock.appendChild(period);
        experienceBlock.appendChild(experienceInfo);
        experienceSection.appendChild(experienceBlock);
    }

    /*
        Filling education block
    */
    for(var j=0; j < education.length; j++){
        var educationBlock = document.createElement('div');
        var outYear = document.createElement('div');
        var year = document.createElement('span');
        var educationInfo = document.createElement('div');
        outYear.classList.add("left");
        educationBlock.classList.add("block");
        //educationInfo.classList.add("right");
        educationInfo.innerHTML = '<p>' + education[j].education_name + '</p><p>' + education[j].education_profession + '</p>';
        year.innerHTML = education[j].education_year;
        
        outYear.appendChild(year);
        educationBlock.appendChild(outYear);
        educationBlock.appendChild(educationInfo);
        educationSection.appendChild(educationBlock);
    }
}

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function createOpenVacancy() {
    var token = getCookie('api_token');
    apiRequest = new XMLHttpRequest();
    apiRequest.open('GET', '<api-vacantions-url>', true);
    apiRequest.setRequestHeader('Authorization', 'Token ' + token);
    apiRequest.onload = function() {
        //console.log(apiRequest.responseText);
        var vacancys = JSON.parse(apiRequest.responseText);
        var openVacancy = document.getElementById("vacancy-id");

        for(var i = 0; i < vacancys.length; i++) {
            var opty = new Option(vacancys[i].job_name, vacancys[i].id);
            openVacancy.appendChild(opty);
        }
        createCity();
    }
    apiRequest.send();
}

function createCity() {
    var token = getCookie('api_token');
    apiRequest = new XMLHttpRequest();
    apiRequest.open('GET', '<api-city-url>', true);
    apiRequest.setRequestHeader('Authorization', 'Token ' + token);
    apiRequest.onload = function() {
        //console.log( JSON.parse(apiRequest.responseText));
        var cities = JSON.parse(apiRequest.responseText);
        var cityOfVacancy = document.getElementById("city-list-id");

        for(var i = 0; i < cities.length; i++){
            var opty = new Option(cities[i].value, cities[i].value);
            cityOfVacancy.appendChild(opty);
        }
    }
    apiRequest.send();
}

function selectedVacancy(event) {
    var target = event.target;

    if(target.tagName == "OPTION"){
        var record = new Option(target.innerHTML, target.value);
        document.getElementById("choices-id").appendChild(record);
        target.hidden = true;
        target.selected = true;
    }
}

function deletedVacancy(event) {
    var target = event.target;

    if(target.tagName == "OPTION"){
        var open = document.getElementById("vacancy-id");
        var choice = document.getElementById("choices-id");

        for(var i = 0; i < open.children.length; i++) {
            if(open.children[i].value == target.value) {
                open.children[i].hidden = false;
                open.children[i].selected = false;
            }
        }

        choice.removeChild(target);
    }
}

function CandidateVacancy(){
    /*
        Return object
        If vacancies is valid return list
        Else false
    */

    var choice = document.getElementById("choices-id");
    var vacancies = [];

    for(var i = 0; i < choice.children.length; i++) {
        vacancies.push(choice.children[i].value);
    }

    if(vacancies.length > 0)
        var isValid = true;
    else
        var isValid = false;

    this.vacancies = vacancies;
    this.valid = isValid;
}

function CandidateInfo() {
    /*
        Check required fields
        Return object 
    */

    var info = document.getElementById("fields-id");
    var inputs = document.querySelectorAll("input");
    var personData = {};
    var isNotValidFields = [];
    var isNotValidCount = 0;

    for(var i = 0; i < inputs.length; i ++){
        if(inputs[i].tagName == "INPUT" && inputs[i].type != "button"){
            if((inputs[i].value == undefined || 
                inputs[i].value == null ||
                inputs[i].value == "") && 
                inputs[i].required == true){
                isNotValidFields.push(inputs[i]);
                isNotValidCount++;
            } else {
                personData[inputs[i].name] = inputs[i].value;
                inputs[i].classList.remove("empty");
            }
        }
    }

    var genderSelect = document.getElementById("sex-id");
    var havingCar = document.getElementById("having-car-id");

    for(var j = 0; j < genderSelect.children.length; j++){
        if(genderSelect[j].selected == true)
            personData.gender = genderSelect[j].value;
    }

    for(var j = 0; j < havingCar.children.length; j++){
        if(havingCar[j].selected == true)
            personData.auto_flag = havingCar[j].value;
    }

    if(isNotValidCount > 0)
        var isValid = false;
    else
        var isValid = true;

    this.personData = personData;
    this.listIsNotValid = isNotValidFields;
    this.valid = isValid;
}

function saveResume() {
    resumeVacancies = new CandidateVacancy();
    personData = new CandidateInfo();
    var requestObject = {};

    if(!resumeVacancies.valid)
        document.getElementById("choices-id").classList.add("empty");
    else
        document.getElementById("choices-id").classList.remove("empty");

    if(!personData.valid) {
        for(var i = 0; i < personData.listIsNotValid.length; i++) {
            personData.listIsNotValid[i].classList.add("empty");
        }
    }

    if(!resumeVacancies.valid || !personData.valid)
            alert("Необходимо заполнить обязательные поля!");
    else{
        requestObject.resume_content = personData.personData;
        requestObject.vacancies = resumeVacancies.vacancies;
        requestObject.action = "save";

        chrome.runtime.sendMessage(JSON.stringify(requestObject));
        window.close();
    }
}

/*
    This function searching for pattern substring in vacancies list
*/
function searchVacancy(event) {
    var openVacancy = document.getElementById("vacancy-id").children;
    var searchStr = document.getElementById("vacancy-search-id").value.toLowerCase();

    if (event.keyCode > 32) {
        for(var i = 0; i < openVacancy.length; i++){
            var startIndex = openVacancy[i].innerHTML.toLowerCase().indexOf(searchStr);

            if(startIndex != -1 && !openVacancy[i].selected)
                openVacancy[i].hidden = false;
            else
                openVacancy[i].hidden = true;
        }
    }

    if(event.keyCode === 8) {
        for(var j = 0; j < openVacancy.length; j++){
            if(!openVacancy[j].selected)
                openVacancy[j].hidden = false;
        }

        if(searchStr != "") {
            for(var i = 0; i < openVacancy.length; i++){
                var startIndex = openVacancy[i].innerHTML.toLowerCase().indexOf(searchStr);

                if(startIndex != -1 && !openVacancy[i].selected)
                    openVacancy[i].hidden = false;
                else
                    openVacancy[i].hidden = true;
            
            }
        }
    }
}
