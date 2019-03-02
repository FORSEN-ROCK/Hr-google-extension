document.addEventListener("DOMContentLoaded", function() {
    //loadResumes();
    //window.addEventListener("blur", closedBackground);
    chrome.runtime.sendMessage(JSON.stringify({"action": "load"}), function() {});
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            createRecords(JSON.parse(request));
        }
    );
    window.addEventListener("beforeunload", function() {
        chrome.runtime.sendMessage(JSON.stringify({"action": "close-my-candidates"}), function() {});
    });
});

function createRecords(resumes) {
    //console.log(resumes);
    var tabel = document.getElementById("resumes-table-id");
    for(var i=0; i < resumes.length; i++){
        moment.locale('ru');
        var created = moment(resumes[i].created, "YYYY-MM-DD");
        //moment.lang('ru');
        var dr = document.createElement("tr");
        var dateTd = document.createElement("td");
        var sourceLinkTd = document.createElement("td");
        var siebelLinkTd = document.createElement("td");
        //var vacancyTd = document.createElement("td");
        var sourceLink = document.createElement("a");
        var siebelLink = document.createElement("a");
        var dateElm = document.createElement("date");
        var full_name = resumes[i].last_name + ' ' + resumes[i].first_name;//+ ' ' + resumes[i].middle_name
        dateElm.innerHTML = created.format('MMMM DD YYYY');
        dateTd.appendChild(dateElm);
        sourceLink.href = resumes[i].url;
        sourceLink.innerHTML = resumes[i].title_resume;
        sourceLinkTd.appendChild(sourceLink);
        siebelLink.href = resumes[i].siebel_link;

        if(resumes[i].last_name == null || resumes[i].first_name == null)
            siebelLink.innerHTML = resumes[i].out_id;
        else
            siebelLink.innerHTML = full_name;

        siebelLinkTd.appendChild(siebelLink);
        //vacancyTd.innerHTML = resumes[i].vacancys;//[0];
        dr.appendChild(dateTd);
        dr.appendChild(sourceLinkTd);
        dr.appendChild(siebelLinkTd)
        //dr.appendChild(vacancyTd);
        tabel.appendChild(dr);
    }
}