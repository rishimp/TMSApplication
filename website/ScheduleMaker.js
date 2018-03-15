var express = require('express');
var tmsparser = require('./TMSParser.js');

var app = express();
app.use(express.static("."));
var parser = new tmsparser.ClassParser();



app.get("/getSchedules", function() {

  parser.once('classList', function(msg) {
    var validSchedules = getSchedules(msg);
    var finalSchedule = removeInvalidHonors(validSchedules);
    html = "<table>";
    for()


    res.send();
  });

  parser.getClassList([[122,"BIO"], [164, "CS"], [101, "ANTH"], [230, "COM"], [120, "PSY"], [101, "SOC"]]);
}

function removeInvalidHonors(scheduleLs) {
  var newScheduleLs = [];
  for(var i = 0; i < scheduleLs.length; i++) {
    if(isValidHonors(scheduleLs[i])) {
      newScheduleLs.push(scheduleLs[i]);
    }
  }
  return newScheduleLs;
}

function isValidHonors(schedule) {
  for(var i = 0; i < schedule.length; i++) {
    if(schedule[i].section.includes("H")) {
      for(var j = 0; j < schedule.length; j++) {
        if((schedule[i].subject == schedule[j].subject) && (schedule[i].number == schedule[j].number) && (i != j)) {
          if(!schedule[j].section.includes("H")) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

function dist_concat(el, ls) {
  var curr = [];
  var newLs = [];
  for(var i = 0; i < ls.length; i++) {
    curr.push(el);
    curr = curr.concat(ls[i]);
    newLs.push(curr);
    curr = [];
  }
  return newLs;
}

function getCombinations(ls, oldMasterLs) {
  var masterLs = [];
  var currLs = [];
  var currEl;
  for(var i = 0; i < ls.length; i++) {
    currEl = ls[i];
    currLs = dist_concat(currEl, oldMasterLs);
    masterLs = masterLs.concat(currLs);
    currLs = [];
  }
  return masterLs;
}

function getAllCombinations(ls) {
  var masterLs = [];
  var currentLs = getCombinations(ls[ls.length-1], [[]]);
  for(var i = ls.length-2; i >= 0; i--) {
    currentLs = getCombinations(ls[i], currentLs);
  }
  return currentLs;
}

function getSchedules(classLs) {
  var schedules = getAllCombinations(classLs)
  var masterSchedule = [];
  for(var i = 0; i < schedules.length; i++) {
    if(isValidSchedule(schedules[i])) {
      //console.log("worked");
      masterSchedule.push(schedules[i]);
    }
  }
  return masterSchedule;
}


//checks if the current classes are valid for first part
function isValidSchedule(currentLs) {
  for(var i = 0; i < currentLs.length; i++) {
    for(var j = i+1; j < currentLs.length; j++) {
      if(hasConflict(currentLs[i], currentLs[j])) {
        return false
      }
    }
  }
  return true;
}


//checks for time conflicts by distributing time and checking for overlap
function hasConflict(classObj1, classObj2) {

  if(classObj1.type == "Lab &amp; Recitation" && classObj2.type == "Lab &amp; Recitation") {
    var labtime1 = classObj1.labtime;
    var recitationtime1 = classObj1.recitationtime;
    var labday1 = classObj1.labday;
    var recitationday1 = classObj1.recitationday;
    var labtime2 = classObj2.labtime;
    var recitationtime2 = classObj2.recitationtime;
    var labday2 = classObj2.labday;
    var recitationday2 = classObj2.recitationday;
    return hasTimeConflict(labtime1, labday1, labtime2, labday2) ||
            hasTimeConflict(labtime1, labday1, recitationtime2, recitationday2) ||
            hasTimeConflict(recitationtime1, recitationday1, labtime2, labday2) ||
            hasTimeConflict(recitationtime1, recitationday1, recitationtime2, recitationday2);
  }
  else if(classObj1.type == "Lab &amp; Recitation") {
    var labtime = classObj1.labtime;
    var recitationtime = classObj1.recitationtime;
    var labday = classObj1.labday;
    var recitationday = classObj1.recitationday;
    var time2 = classObj2.time;
    var day2 = classObj2.day;
    return hasTimeConflict(labtime, labday, time2, day2) || hasTimeConflict(recitationtime, recitationday, time2, day2);
  }
  else if(classObj2.type == "Lab &amp; Recitation") {
    var labtime = classObj2.labtime;
    var recitationtime = classObj2.recitationtime;
    var labday = classObj2.labday;
    var recitationday = classObj2.recitationday;
    var time2 = classObj1.time;
    var day2 = classObj1.day;
    return hasTimeConflict(labtime, labday, time2, day2) || hasTimeConflict(recitationtime, recitationday, time2, day2);
  }
  else {
    var time1 = classObj1.time;
    var day1 = classObj1.day;
    var time2 = classObj2.time;
    var day2 = classObj2.day;
    return hasTimeConflict(time1, day1, time2, day2);
  }
}

function hasTimeConflict(time1, day1, time2, day2) {
  if((day1.includes("M") && day2.includes("M")) ||
     (day1.includes("T") && day2.includes("T")) ||
     (day1.includes("W") && day2.includes("W")) ||
     (day1.includes("R") && day2.includes("R")) ||
     (day1.includes("F") && day2.includes("F"))) {

    var time1Start = time1[0];
    var time2Start = time2[0];
    var time1End = time1[1];
    var time2End = time2[1];

    if(time1Start < time2Start) {
      return time1End - time2Start > 0;
    }
    else if(time2Start < time1Start) {
      return time2End - time1Start > 0;
    }
    else {
      return true;
    }
  }
  else {
    return false;
  }
}
