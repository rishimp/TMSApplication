var request = require('request');
var cheerio = require('cheerio');

var crsSubject;

//HOW TO USE: run node server.js on this file's directory and you should see an output

//send the class number and subject here
makeRequest(171,"CS");

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
    	var $ = cheerio.load(body);
    	var innerTable = "<table>" + $('.even').parent().html() + "</table>";
    	$ = cheerio.load(innerTable);
    	//prints out the classes
    	console.log(organizeArray(parseHTML($, crsSubject)));
    	//this is where the algorithm will be and I plan to put an emitter here to send the data back
    }

}

//organizes the labs with their lecture and formats the time
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

//parses the time into a 24 hour format then turns it into an integer for use
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

//checks for time conflicts by distributing time and checking for overlap
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

//parses HTML of Drexel's TMS site to get table
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

//parses a single entry of Drexel's TMS site and takes out specific data
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

//makes a request to Drexel's TMS with a specific course number
function makeRequest(crsNum, crsSub) {
	crsSubject = crsSub;
	var options = {
    	url: 'https://termmasterschedule.drexel.edu/webtms_du/app?formids=term%2CcourseName%2CcrseNumb%2Ccrn&component=searchForm&page=Home&service=direct&submitmode=submit&submitname=&term=1&courseName=&crseNumb='+crsNum+'&crn=',
    	method: 'POST',
	};
	request(options, callback);
}

//TODO: this function is still in progress
function createSchedule(scheduleArray) {
	for(var i = 0; i < scheduleArray.length; i++) {
		makeRequest(scheduleArray[i][0], scheduleArray[i][1]);
	}
}
