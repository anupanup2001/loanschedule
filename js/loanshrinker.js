//console.log("Hello World");

var calculateLoanSchedule = function (principal, emi, roi, startDate) {
//    console.log("In function calculateLoanSchedule");
    var currEmi = emi;
    var currRoi = roi;
    var arrSchedule = [];
    var principalRem = principal;
    var emiInt = principal * roi/12.0/100.0;
    var emiPrin = emi - emiInt;
    var month = new Date(2013,0,1);
    arrSchedule.push({
	principalRem:principalRem,
	emi: currEmi,
	roi: currRoi,
	emiInt: emiInt,
	emiPrin: emiPrin,
        month: month
    });

    //Now calculate remaining period
    var currMonth = month;
    for (var i = 1; principalRem - emiPrin > 0; i++) {
	principalRem = principalRem - emiPrin;
	emiInt = principalRem * roi/12.0/100.0;
        emiPrin = currEmi - emiInt;
        //For last month, emi should only be to complete loan.
        if (emiPrin > principalRem) {
            emiPrin = principalRem;
        }
        currMonth = new Date(currMonth);
        currMonth.setMonth(currMonth.getMonth() + 1);

	arrSchedule.push({
	    principalRem: principalRem,
	    emi: currEmi,
	    roi: currRoi,
	    emiInt: emiInt,
	    emiPrin: emiPrin,
            month: currMonth
	});
    }
    return arrSchedule;
};

/*
    var arr = calculateLoanSchedule(2290889, 22489, 10.25, 1);
    for (var i = 0; i < arr.length; i++) {
     console.log("<li>" + arr[i].principalRem + "</li>");
     console.log("<li>" + arr[i].month + "</li>");
    }
*/
