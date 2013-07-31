//console.log("Hello World");

var calculateLoanSchedule = function (principal, emi, roi, startDate) {
//    console.log("In function calculateLoanSchedule");
    var currEmi = emi;
    var currRoi = roi;
    var arrSchedule = [];
    var principalRem = principal;
    var emiInt = principal * roi/12.0/100.0;
    var emiPrin = emi - emiInt;
    arrSchedule.push({
	principalRem:principalRem,
	emi: currEmi,
	roi: currRoi,
	emiInt: emiInt,
	emiPrin: emiPrin
    });

    //Now calculate remaining period
    for (var i = 1; principalRem - emiPrin > 0; i++) {
	principalRem = principalRem - emiPrin;
	emiInt = principalRem * roi/12.0/100.0;
	emiPrin = currEmi - emiInt;

	arrSchedule.push({
	    principalRem: principalRem,
	    emi: currEmi,
	    roi: currRoi,
	    emiInt: emiInt,
	    emiPrin: emiPrin
	});
    }
    return arrSchedule;
};

/*
    var arr = calculateLoanSchedule(2290889, 22489, 10.25, 1);
    for (var i = 0; i < arr.length; i++) {
     console.log("<li>" + arr[i].principalRem + "</li>");
    }
*/
