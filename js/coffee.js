var timer,
    timerId = 0,
    millis = 0,
    tableHistory,
    tableTop,
    startDate = 0,
    endDate = 0;

$(document).ready(function(){
    timer = $("#timerText");
    tableHistory = $("#history>tbody");
    tableTop = $("#top>tbody");
	makeRequest(millis);

    $("button#btnStart").on("click", function(){
        var buttonText = $(this).html();

        if (buttonText === "Start") {
            $(this).html("Stop");
            startDate = +new Date();
            timerId = setInterval(changeText, 100);
        } else {
            $(this).html("Start");
            window.clearInterval(timerId);
            makeRequest(millis);
            millis = 0;
        }
    });

    $("button#btnTop").on("click", function(){
        // TODO: Make switcher for hide/show
        // $(this).next().hide(100);
    });
});

function showLoading(){
    tableHistory.html('<tr><td colspan="2"><img src="img/loading.gif"></td></tr>').css("text-align", "center");
    tableTop.html('<tr><td colspan="2"><img src="img/loading.gif"></td></tr>').css("text-align", "center");
}

/**
* if seconds == 0 then get data only
* if seconds > 0 get data and save seconds to DB
*/
function makeRequest(seconds){
    showLoading();
    $.ajax({
        url: "php/coffee.php",
        method: "post",
        dataType: "json",
        data: {timer: millis},
        success: function(data){
            var html = "No data available...";
            data.records.forEach(function(item, i){
                html += "<tr><td>" + item["date"] + "</td><td>" +  secToHHMMSS(item["millis"])  + "</td></tr>";
            });
            tableHistory.html(html);

            html = "No data available...";
            data.top.forEach(function(item, i){
                html += "<tr><td>" + item["date"] + "</td><td>" + secToHHMMSS(item["millis"]) + "</td></tr>";
            });
            tableTop.html(html);
        },
        error: function (){
            var errorText = '<tr><td  colspan="2">Sorry, something went wrong...</td></tr>';
            tableHistory.html(errorText).css("text-align", "center");
            tableTop.html(errorText).css("text-align", "center");
        },
    });
}

function changeText(){
    endDate = +new Date();
    millis = endDate - startDate;
    timer.html(secToHHMMSS(millis, true));
}

function secToHHMMSS(milliseconds, animate){
    var millis = parseInt(milliseconds, 10);
    var sec = millis / 1000;
    var hh = Math.floor(sec / 3600);
    var mm = Math.floor((sec - hh * 3600) / 60);
    var ss = Math.floor(sec - hh * 3600 - mm * 60);

    /*console.log('millis: ' + millis);
    console.log('sec: ' + sec);
    console.log('hh: ' + hh);
    console.log('mm: ' + mm);
    console.log('ss: ' + ss);
    console.log('---------------------------------------');*/

    if (animate === true) {
        var delimiter = (ss % 2 === 0) ? ":" : " ";
    } else {
        var delimiter = ":";
    }

    if (hh < 10) {
        hh = '0' + hh;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    if (ss < 10) {
        ss = '0' + ss;
    }

    return hh + delimiter + mm + delimiter + ss;
}