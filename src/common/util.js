'use strict';
var moment = require('moment');

/**
 * returns the first and last day of a given date
 *
 * @param date
 * @returns {{start: Date, end: Date}}
 */
function calculateFirstLastDayOfMonth(date) {
    var date = new Date(date);
    var year = date.getFullYear(), month = date.getMonth();
    var firstDay = moment(new Date(year, month, 1));
    firstDay.subtract(parseInt(firstDay.format('E')) - 1, 'day');

    var lastDay = moment(new Date(year, month + 1, 0));
    lastDay.add(7 - parseInt(lastDay.format('E')), 'day');

    return {'start': firstDay.toDate(), 'end': lastDay.toDate()};
}

function getHolidaysForDateRange(dateRange) {
    var holidays = {};
    var start = moment(dateRange.start);
    var end = moment(dateRange.end);
    do {
        var yearHolidays = getHolidaysForYear(start.year());

        for (var date in yearHolidays) {
            var holidayDate = moment(date, 'YYYY-MM-DD');
            var holiday = yearHolidays[date];
            if (holidayDate.isBefore(start)) continue;
            if (holidayDate.isAfter(end)) continue;
            holidays[date] = holiday;
        }

        start.add(1, 'year');
    } while (start.isBefore(end, 'year'));

    return holidays;
}

function getHolidaysForYear(year) {
    var holidays = {};
    holidays[year + '-01-01'] = 'Neujahr';
    holidays[year + '-01-06'] = 'Hl. Drei Könige';
    holidays[calculateEasterSondayPlusXDate(year, 1)] = 'Ostermontag';
    holidays[year + '-05-01'] = 'Staatsfeiertag';
    holidays[calculateEasterSondayPlusXDate(year, 39)] = 'Christi Himmelfahrt';
    holidays[calculateEasterSondayPlusXDate(year, 50)] = 'Pfingstmontag';
    holidays[calculateEasterSondayPlusXDate(year, 60)] = 'Fronleichnam';
    holidays[year + '-08-15'] = 'Mariä Himmelfahrt';
    holidays[year + '-10-26'] = 'Nationalfeiertag';
    holidays[year + '-11-01'] = 'Allerheiligen';
    holidays[year + '-12-08'] = 'Mariä Empfängnis';
    holidays[year + '-12-24'] = 'Heiliger Abend';
    holidays[year + '-12-25'] = 'Christtag';
    holidays[year + '-12-26'] = 'Stefanitag';
    holidays[year + '-12-31'] = 'Silvester';
    return holidays;
}

/*
 Berechnung Ostersonntag laut Wikipedia

 a = Jahr mod 19
 b = Jahr mod 4
 c = Jahr mod 7
 k = Jahr div 100
 p = (8k + 13) div 25
 q = k div 4
 M = (15 + k − p − q) mod 30
 d = (19a + M) mod 30
 N = (4 + k − q) mod 7
 e = (2b + 4c + 6d + N) mod 7
 Ostern = (22 + d + e)ter März
 (Der 32. März ist der 1. April usf.)
 */

function calculateEasterSondayPlusXDate(year, addDays) {
    addDays = addDays || 0;

    var a = year % 19;
    var b = year % 4;
    var c = year % 7;
    var k = Math.floor(year / 100);

    var p = Math.floor((8 * k + 13) / 25);
    var q = Math.floor(k / 4);
    var M = (15 + k - p - q) % 30;
    var d = (19 * a + M) % 30;
    var N = (4 + k - q) % 7;
    var e = (2 * b + 4 * c + 6 * d + N) % 7;

    var month = 3;
    var day = 22 + d + e;

    // add Days for "x days after Easter"-Holidays
    day += addDays;

    // Theoretical TODO: Fix for 29-day Februaries (not really needed for current holiday calculations)
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    while (day > daysInMonth[month - 1]) {
        day -= daysInMonth[month - 1];
        month++;
        if (month > 12) month = 1;
    }

    return year + '-' + padout(month) + '-' + padout(day);
}

function padout(number) {
    return (number < 10) ? '0' + number : number;
}

// use timeUtils:getDayDuration DUPLICATES!!
function getDayDuration(duration) {
    var week = duration.asMinutes();
    return moment.duration(Math.round(week / 5), 'minutes');
}
function getHalfDayDuration(duration) {
    var week = duration.asMinutes();
    return moment.duration(Math.round(week / 10), 'minutes');
}

exports.calculateFirstLastDayOfMonth = calculateFirstLastDayOfMonth;
exports.getHolidaysForDateRange = getHolidaysForDateRange;

exports.getDayDuration = getDayDuration;
exports.getHalfDayDuration = getHalfDayDuration;
