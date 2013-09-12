//console.log("Hello World");

var calculateLoanSchedule = function (principal, emi, roi, startDate) {
//    console.log("In function calculateLoanSchedule");
    var currEmi = emi;
    var currRoi = roi;
    var arrSchedule = [];
    var principalRem = principal;
    var emiInt = principal * roi/12.0/100.0;
    var emiPrin = emi - emiInt;
//    var month = new Date(2013,0,1);
    var month = startDate;
    arrSchedule.push({
	principalRem:principalRem,
	emi: currEmi,
	roi: currRoi,
	emiInt: emiInt,
	emiPrin: emiPrin,
        month: month,
        prePayment: 0,
        addLoan: 0,
        changed: 0
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
            month: currMonth,
            prePayment: 0,
            addLoan: 0,
            changed: 0
	});
    }
    return arrSchedule;
};

var recalculateLoanSchedule = function(arrSchedule, initialInterest, initialEMI) {
    var l_cEMIChange = 1;
    var l_cInterestChange = 2;
    var l_cPrePaymentChange = 4;
    var l_cAddLoanChange = 8;
    var l_changeFlag = 0;

    if (arrSchedule.length <= 0) {
        return "";
    }

    l_changeFlag = arrSchedule[0].changed;
    if ((l_changeFlag & l_cPrePaymentChange) != l_cPrePaymentChange) {
        arrSchedule[0].prePayment = 0;
    }

    if ((l_changeFlag & l_cAddLoanChange) != l_cAddLoanChange) {
        arrSchedule[0].addLoan = 0;
    }

    var currEmi, currRoi;
    if ((l_changeFlag & l_cEMIChange) == l_cEMIChange) {
        currEmi = arrSchedule[0].emi;
    }
    else {
        currEmi = initialEMI;
        arrSchedule[0].emi = currEmi;
    }
    if ((l_changeFlag & l_cInterestChange) == l_cInterestChange) {
        currRoi = arrSchedule[0].roi;
    }
    else {
        currRoi = initialInterest;
        arrSchedule[0].roi = currRoi;
    }
    var principalRem = arrSchedule[0].principalRem + arrSchedule[0].addLoan;
    var emiInt = principalRem * currRoi / 12.0/100.0;
    var emiPrin = currEmi - emiInt - arrSchedule[0].prePayment;
    var month = arrSchedule[0].month;

    //arrSchedule[0].principalRem = principalRem;
    arrSchedule[0].emiInt = emiInt;
    arrSchedule[0].emiPrin = emiPrin;

    //Now calculate for remaining period
    var i = 1;
    for (i = 1; principalRem - emiPrin > 0; i++) {
        if (i < arrSchedule.length ) {
            
            l_changeFlag = arrSchedule[i].changed;
            if ((l_changeFlag & l_cInterestChange) == l_cInterestChange) {
                currRoi = arrSchedule[i].roi;
            }
            if ((l_changeFlag & l_cEMIChange) == l_cEMIChange) {
                currEmi = arrSchedule[i].emi;
            }
        }
        principalRem = principalRem - emiPrin;
        if (i < arrSchedule.length){
            principalRem = principalRem + arrSchedule[i].addLoan;
        }
        emiInt = principalRem * currRoi/12.0/100.0;
        emiPrin = currEmi - emiInt;
        if (emiPrin < 0) {
            return "Negative amortization from month " + arrSchedule[i].month;
        }
        if (i < arrSchedule.length) {
            emiPrin = emiPrin + arrSchedule[i].prePayment
        }
        if (emiPrin > principalRem) {
            emiPrin = principalRem;
        }

        //Update array if less than length.
        if (i < arrSchedule.length) {
            month = arrSchedule[i].month;
            arrSchedule[i].principalRem = principalRem
            arrSchedule[i].emi = currEmi;
            arrSchedule[i].roi = currRoi;
            arrSchedule[i].emiInt = emiInt;
            arrSchedule[i].emiPrin = emiPrin;
        }
        else {
            month = new Date(month);
            month.setMonth(month.getMonth() + 1);
            arrSchedule.push({
                principalRem: principalRem,
                emi: currEmi,
                roi: currRoi,
                emiInt: emiInt,
                emiPrin: emiPrin,
                month: month,
                prePayment: 0,
                addLoan: 0,
                changed: 0
                
            });
        }
        
        
    }

    //Truncate array if necessary
    if (i < arrSchedule.length) {
        arrSchedule.splice(i, arrSchedule.length - i);
    }

    return "";
};

/*
    var arr = calculateLoanSchedule(2290889, 22489, 10.25, 1);
    for (var i = 0; i < arr.length; i++) {
     console.log("<li>" + arr[i].principalRem + "</li>");
     console.log("<li>" + arr[i].month + "</li>");
    }
*/
