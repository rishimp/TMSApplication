var request = require('request');
var cheerio = require('cheerio');

var crsSubject;


createSchedule([[164, "CS"],[171, "CS"]]);


function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
    	var $ = cheerio.load(body);
    	var innerTable = "<table>" + $('.even').parent().html() + "</table>";
    	$ = cheerio.load(innerTable);
    	holdSchedules(organizeArray(parseHTML($, crsSubject)));
    	//console.log(hasConflict([1,20,3,40],[2,50,6,10]))
    }

}

function organizeArray(array) {
	for(var i = 0; i < array.length; i++) {
		array[i][6] = parseTime(array[i][6]);
		if(array[i][2] == "Lab") {
			for(var j = 0; j < array.length; j++) {
				if(array[j][2] == "Lecture") {
					array[j][7].push(array[i].toString());
				}
			}
			array.splice(i, 1);
			i--;
		}
	}
	return array;
}

function parseTime(timeString) {
	var timeArr = timeString.split(/[\s:]+/);
	var milArr = [0,0];
	milArr[0] = parseInt(timeArr[0]);
	milArr[1] = parseInt(timeArr[4]);

	if(timeArr[2] == "am" && milArr[0] == 12) {
		milArr[0] = 0;
	}
	else if(timeArr[2] == "pm" && milArr[0] != 12) {
		milArr[0] = milArr[0] + 12;
	}
	
	if(timeArr[6] == "am" && milArr[1] == 12) {
		milArr[1] = 0;
	}
	else if(timeArr[6] == "pm" && milArr[1] != 12) {
		milArr[1] = milArr[1] + 12;
	}

	return [parseInt(milArr[0]+""+timeArr[1]), parseInt(milArr[1]+""+timeArr[4])];

}

function hasConflict(time1, time2) {
	var time1Start = time1[0];
	var time2Start = time2[0];
	var time1End = time1[1];
	var time2End = time2[2];
	if(time1Start < time2Start) {
		return time2Start < time1End;
	}
	else {
		return time1Start < time2End;
	}
}

function parseHTML(selector, subject) {
	var $ = selector;
	var arr = [];
	var element = [];
	for(var i = 1; $('tr').eq(i).html() != null; i++) {
		element = parseRow($('tr').eq(i).html());
		if(element[0] == subject) {
			arr.push(element)
		}
	}
	return arr;
}

function parseRow(row) {
	var arr = row.split(/[><]+/);
	if(arr.length < 20 || arr[18] == 'p title="FULL"') {
		return ['ignore']
	}
	var subject = arr[2];
	var number = arr[6];
	var type = arr[10];
	var section = arr[14];
	var crn = arr[20];
	var day = arr[37];
	var time = arr[41];
	var labs = [];
	return [subject, number, type, section, crn, day, time, labs];

}

function makeRequest(crsNum, crsSub) {
	crsSubject = crsSub;
	var options = {
    	url: 'https://termmasterschedule.drexel.edu/webtms_du/app?formids=term%2CcourseName%2CcrseNumb%2Ccrn&component=searchForm&page=Home&service=direct&submitmode=submit&submitname=&term=1&courseName=&crseNumb='+crsNum+'&crn=',
    	method: 'POST',
	};
	request(options, callback);
}

function createSchedule(scheduleArray) {
	for(var i = 0; i < scheduleArray.length; i++) {
		makeRequest(scheduleArray[i][0], scheduleArray[i][1]);
	}
	//console.log(scheduleArray);
}

var scheduleList = [];
function holdSchedules(array) {
	scheduleList.push(array);
}

console.log(scheduleList);
