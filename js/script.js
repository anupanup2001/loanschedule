//var totPrinPaid = 0;
//var totIntPaid = 0;

var month_names = new Array ( );
month_names[month_names.length] = "Jan";
month_names[month_names.length] = "Feb";
month_names[month_names.length] = "Mar";
month_names[month_names.length] = "Apr";
month_names[month_names.length] = "May";
month_names[month_names.length] = "Jun";
month_names[month_names.length] = "Jul";
month_names[month_names.length] = "Aug";
month_names[month_names.length] = "Sep";
month_names[month_names.length] = "Oct";
month_names[month_names.length] = "Nov";
month_names[month_names.length] = "Dec";

//Moved google.load to top to fix this bug -> http://stackoverflow.com/questions/9519673/why-does-google-load-cause-my-page-to-go-blank
google.load('visualization', '1.0', {'packages':['corechart']});
var pieChart, colChart;
$(document).ready(function() {
    //$("#repaymenTable")
    var emiArray = null;
    $('#btnCalculate').click(function(event){
        var l_sPrin = $('#inpPrinRemain').val();
        var l_sEmi = $('#inpEmi').val();
        var l_sInterest = $('#inpInterest').val();
        var l_sMsg = validateInputs(l_sPrin, l_sEmi, l_sInterest);
        setErrorMsg(l_sMsg);
        if (l_sMsg != "")
            return;
        var prin = parseFloat(l_sPrin);
        var emi = parseFloat(l_sEmi);
        var interest = parseFloat(l_sInterest);
        var startDate = $('#inpStartDate').val();
        var startMonth = startDate.slice(0,2);
        var startYear = startDate.slice(2);

        var $tb = $('#repaymentTable table tbody');
        var emiMonthArray = calculateLoanSchedule(prin, emi, interest, new Date(startYear, startMonth - 1, 1));
        emiArray = emiMonthArray;
        
        // Instantiate and draw our chart, passing in some options.
        pieChart = new google.visualization.PieChart($('#chart_div')[0]);
        colChart = new google.visualization.ColumnChart($('#bar_chart_div')[0]);
        displayTable($tb, emiMonthArray);
        //Set focus to first input
        $('#inpPrinRemain').focus();
        $('#inpPrinRemain').select();
    });
    
    $('#dataChangeModal').on('hidden.bs.modal', function () {
        //Toggle highlighting of selected row
        var l_nRowId = parseInt($('#labelMonthNumber').text());
        $('#repaymentTable tbody tr:nth-child(' + l_nRowId + ')').removeClass('active');
        $('#dataChangeModal input').removeClass('green');
    });

    $('#btnChangeUndoChange').click(function() {
        var l_nIndex = parseInt($('#labelMonthNumber').text() - 1);
        emiArray[l_nIndex].changed = 0;
        emiArray[l_nIndex].prePayment = 0;
        emiArray[l_nIndex].addLoan = 0;
        var l_nInitialEMI = parseFloat($('#inpEmi').val());
        var l_nInitialInterest = parseFloat($('#inpInterest').val());
        var l_nInitialPrincipal = parseFloat($('#inpPrinRemain').val());
        var l_sMsg = recalculateLoanSchedule(emiArray, l_nInitialPrincipal, l_nInitialInterest, l_nInitialEMI);
        var $tb = $('#repaymentTable table tbody');
        $('#dataChangeModal').modal('toggle')
        displayTable($tb, emiArray);

    });

    
    $('#btnChangeSave').click(function() {
        var l_cEMIChange = 1;
        var l_cInterestChange = 2;
        var l_cPrePaymentChange = 4;
        var l_cAddLoanChange = 8;

        var l_changeFlag = 0;
        var l_nIndex = parseInt($('#labelMonthNumber').text() - 1);

        l_changeFlag = emiArray[l_nIndex].changed;
        //Check if any value changed
        if (emiArray[l_nIndex].emi.toFixed(2) != $('#inpChangeEMI').val()) {
            l_changeFlag = l_changeFlag | l_cEMIChange;
            emiArray[l_nIndex].emi = parseFloat($('#inpChangeEMI').val());
        }
        
        if (emiArray[l_nIndex].roi.toFixed(2) != $('#inpChangeInterest').val()) {
            l_changeFlag = l_changeFlag | l_cInterestChange;
            emiArray[l_nIndex].roi = parseFloat($('#inpChangeInterest').val());
        }
        
        if (parseFloat($('#inpChangeAddPrePayment').val()) != 0) {
            l_changeFlag = l_changeFlag | l_cPrePaymentChange;
            emiArray[l_nIndex].prePayment = parseFloat($('#inpChangeAddPrePayment').val());
        }

        if (parseFloat($('#inpChangeAddLoan').val()) != 0) {
            l_changeFlag = l_changeFlag | l_cAddLoanChange;
            emiArray[l_nIndex].addLoan = parseFloat($('#inpChangeAddLoan').val());
        }
        emiArray[l_nIndex].changed = l_changeFlag;
        var l_nInitialEMI = parseFloat($('#inpEmi').val());
        var l_nInitialInterest = parseFloat($('#inpInterest').val());
        var l_nInitialPrincipal = parseFloat($('#inpPrinRemain').val());
        var l_sMsg = recalculateLoanSchedule(emiArray, l_nInitialPrincipal, l_nInitialInterest, l_nInitialEMI);
        if (l_sMsg != "") {
            alert(l_sMsg);
        }
        var $tb = $('#repaymentTable table tbody');
        $('#dataChangeModal').modal('toggle')
        displayTable($tb, emiArray);
    });

    //Configure datePicker
    $('.date-picker').datepicker( {
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        dateFormat: 'mmyy',
        onClose: function(dateText, inst) { 
            var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
            var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
            $(this).datepicker('setDate', new Date(year, month, 1));
        }
    });


     
    $('.inputForm input').keypress(function(e) {
        if (e.which == 13) {
            $('#btnCalculate').focus().click();
            $(this).focus().select();
        }
    });
    //Add a demo calculation (Default values)

    $('#inpPrinRemain').val('1000000');
    $('#inpEmi').val('13494');
    $('#inpInterest').val('10.5');
    $('#inpStartDate').val('012013');
    $('#btnCalculate').click(); //Simulate click
    
    $('#demoVideoModal').on('shown.bs.modal', function() {
        var $video = $('.demoVideoContainer iframe');
        var l_nWidth = $(".demoVideoContainer").width();
        $video.width(l_nWidth).height(l_nWidth/1.33);
        
    });
    
});

function validateInputs(principal, emi, interest) {
    var l_sRet = "";
    //Check for empty strings first
    if (principal.match(/^ *$/) && emi.match(/^ *$/) && interest.match(/^ *$/)) {
        l_sRet = "All input fields are mandatory";
        return l_sRet;
    }
    if (principal.match(/^ *$/)) {
        l_sRet = "Principal Remaining field is mandatory";
        return l_sRet;
    }
    if (emi.match(/^ *$/)) {
        l_sRet = "EMI field is mandatory";
        return l_sRet;
    }
    if (interest.match(/^ *$/)) {
        l_sRet = "Interest field is mandatory";
        return l_sRet;
    }
    
    //Check numeric values
    if (!principal.match(/^-?[0-9]*\.?[0-9]*$/)) {
        l_sRet = "Principal Remaining is not numeric";
        return l_sRet;
    }
    if (!emi.match(/^-?[0-9]*\.?[0-9]*$/)) {
        l_sRet = "EMI is not numeric";
        return l_sRet;
    }
    if (!interest.match(/^-?[0-9]*\.?[0-9]*$/)) {
        l_sRet = "Interest is not numeric";
        return l_sRet;
    }
    
    //Check negative values
    if(principal.match(/^-/)) {
        l_sRet = "Principal Remaining should be positive";
        return l_sRet
    }
    if(emi.match(/^-/)) {
        l_sRet = "EMI should be positive";
        return l_sRet
    }
    if(interest.match(/^-/)) {
        l_sRet = "Interest should be positive";
        return l_sRet
    }
    
    //Now for all numeric tests
    var l_nPrin = parseFloat(principal);
    var l_nEmi = parseFloat(emi);
    var l_nInterest = parseFloat(interest);
    var startDate = $('#inpStartDate').val();
    var startMonth = startDate.slice(0,2);
    var startYear = startDate.slice(2);

    //Check if interest is greater than 100
    if (l_nInterest > 100) {
        l_sRet = "Interest should be less than 100%";
        return l_sRet;
    }
    
    //Error check for negative amortization
    if (l_nPrin * l_nInterest*0.01/12 >= l_nEmi) {
        l_sRet = 'Negative Amortization... EMI has to be more than ' + (l_nPrin * l_nInterest*0.01/12).toFixed(2);
        return l_sRet;
    }
    
    
    return l_sRet;
}

//Function sets Alert message on some invalid input and hides
//User body in case of error
function setErrorMsg(msg) {
    $('.errorMsg span').html(msg);
    if (msg == '') {
        $('.errorMsg').hide();
        $('.userBody').show();
    }
    else {
        $('.errorMsg').show();
        $('.userBody').hide();
    }
}

//function recalculateArray(emiArray
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var displayTable = function(elem, arr) {
    //var arr = calculateLoanSchedule(2290889, 22489, 10.25, 1);

    var strTableData = "";

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].changed) {
            strTableData += '<tr class="success">';
        }
        else {
            strTableData += "<tr>";
        }
        strTableData += "<td>" + (i + 1) + "</td>";
        strTableData += "<td>" + month_names[arr[i].month.getMonth()] + " " +
            arr[i].month.getFullYear() + "</td>";
        strTableData += "<td>" + arr[i].principalRem.toFixed(2) + "</td>";
        strTableData += "<td>" + arr[i].emiPrin.toFixed(2) + "</td>";
        strTableData += "<td>" + arr[i].emiInt.toFixed(2) + "</td>";
        strTableData += "</tr>";
    }
    
    elem.html(strTableData);
    $('#repaymentTable tbody tr').click(function(event) {
        var l_nArrIndex = this.rowIndex;
        var l_cEMIChange = 1;
        var l_cInterestChange = 2;
        var l_cPrePaymentChange = 4;
        var l_cAddLoanChange = 8;
        var l_changeFlag = arr[l_nArrIndex].changed;
        //Highlight changed text

        if ((l_changeFlag & l_cEMIChange) == l_cEMIChange) {$('#inpChangeEMI').addClass('green');}
        if ((l_changeFlag & l_cInterestChange) == l_cInterestChange) {$('#inpChangeInterest').addClass('green');}
        if ((l_changeFlag & l_cPrePaymentChange) == l_cPrePaymentChange) {$('#inpChangeAddPrePayment').addClass('green');}
        if ((l_changeFlag & l_cAddLoanChange) == l_cAddLoanChange) {$('#inpChangeAddLoan').addClass('green');}

        
        $(this).toggleClass('active');
        $('#labelMonthNumber').html(l_nArrIndex + 1);
        $('#labelMonth').html(month_names[arr[l_nArrIndex].month.getMonth()] + " "
                              + arr[l_nArrIndex].month.getFullYear());
        $('#inpChangeEMI').val(arr[l_nArrIndex].emi.toFixed(2));
        $('#inpChangeInterest').val(arr[l_nArrIndex].roi.toFixed(2));
        $('#inpChangeAddPrePayment').val(arr[l_nArrIndex].prePayment.toFixed(2));
        $('#inpChangeAddLoan').val(arr[l_nArrIndex].addLoan.toFixed(2));
        $('#dataChangeModal').modal('toggle');
    });

    $('#repaymentTable tbody tr').popover({
        placement:'bottom',
        trigger:'hover',
        html:true,
        title:'Click Row to edit',
        content:function(){
            return $('#rowPopover').html();
        }
    });
    
    //Just before popover is shown...
    $('#repaymentTable tbody tr').on('show.bs.popover', function () {
    $('#rowPopover span').removeClass('green');
        var l_nArrIndex = this.rowIndex;
        var l_cEMIChange = 1;
        var l_cInterestChange = 2;
        var l_cPrePaymentChange = 4;
        var l_cAddLoanChange = 8;
        var l_changeFlag = arr[l_nArrIndex].changed;
        $('#popEMI').text(arr[l_nArrIndex].emi.toFixed(2));
        $('#popInterest').text(arr[l_nArrIndex].roi.toFixed(2));
        $('#popPrePay').text(arr[l_nArrIndex].prePayment.toFixed(2));
        $('#popAddLoan').text(arr[l_nArrIndex].addLoan.toFixed(2));
        //Add text color as green
        if ((l_changeFlag & l_cEMIChange) == l_cEMIChange) {$('#popEMI').addClass('green');}
        if ((l_changeFlag & l_cInterestChange) == l_cInterestChange) {$('#popInterest').addClass('green');}
        if ((l_changeFlag & l_cPrePaymentChange) == l_cPrePaymentChange) {$('#popPrePay').addClass('green');}
        if ((l_changeFlag & l_cAddLoanChange) == l_cAddLoanChange) {$('#popAddLoan').addClass('green');}    
    });
/*
    $('#repaymentTable tbody tr').mouseover(function() {
        //Reset previously set green font
        $('#rowPopover span').removeClass('green');
        var l_nArrIndex = this.rowIndex;
        var l_cEMIChange = 1;
        var l_cInterestChange = 2;
        var l_cPrePaymentChange = 4;
        var l_cAddLoanChange = 8;
        var l_changeFlag = arr[l_nArrIndex].changed;
        $('#popEMI').text(arr[l_nArrIndex].emi.toFixed(2));
        $('#popInterest').text(arr[l_nArrIndex].roi.toFixed(2));
        $('#popPrePay').text(arr[l_nArrIndex].prePayment.toFixed(2));
        $('#popAddLoan').text(arr[l_nArrIndex].addLoan.toFixed(2));

        //Add text color as green
        if ((l_changeFlag & l_cEMIChange) == l_cEMIChange) {$('#popEMI').addClass('green');}
        if ((l_changeFlag & l_cInterestChange) == l_cInterestChange) {$('#popInterest').addClass('green');}
        if ((l_changeFlag & l_cPrePaymentChange) == l_cPrePaymentChange) {$('#popPrePay').addClass('green');}
        if ((l_changeFlag & l_cAddLoanChange) == l_cAddLoanChange) {$('#popAddLoan').addClass('green');}
    });
*/
    //arr[2] = null;
//    
//elem.text(strTableData);
    var strLastEmiInfo = 'No. of months: ' + arr.length +
        ' Last EMI is <span class="emphasize">' + month_names[arr[arr.length - 1].month.getMonth()] + " " +
        arr[arr.length-1].month.getFullYear() + ".</span> ";
    $("#lastEmiInfo div h4 .message").html(strLastEmiInfo);
    
    var totPrinPaid = 0;
    var totIntPaid = 0;
    for(var i = 0; i < arr.length; i++) {
        totPrinPaid += arr[i].emiPrin;
        totIntPaid += arr[i].emiInt;
    }

    //Fill in total message below PI diagram chart

    $(".totMsg #totPrinMsg").text(numberWithCommas(Math.round(totPrinPaid*100)/100));
    $(".totMsg #totIntMsg").text(numberWithCommas(Math.round(totIntPaid*100)/100));
    $(".totMsg #totPrinPlusIntMsg").text(numberWithCommas(Math.round((totPrinPaid + totIntPaid)*100)/100));

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Repayment Component');
    data.addColumn('number', 'Rupee');
    data.addRows([
        ['Interest', Math.round(totIntPaid * 100)/100],
        ['Principal', Math.round(totPrinPaid * 100)/100]
    ]);

    // Set chart options
    var options = {'title':'Repayment Component',
                   'height':250,
                   'is3D': true,
                   'colors':['#336699', '#990134']
                  
    };

    
    pieChart.draw(data, options);

    //Draw column chart


    var $colChartDiv = $('#bar_chart_div');

    drawColumnChart($colChartDiv[0], arr);

};


/**
* This function draws barChart for EMI data 
*/
var drawColumnChart = function(colChartDiv, arrEmi) {
    var dataArr = [[]];
    dataArr[0][0] = 'Year';
    dataArr[0][1] = 'Intrst';
    dataArr[0][2] = 'Prin';


    var currYear = arrEmi[0].month.getFullYear();
    var currYearPrin = 0;
    var currYearInt = 0;

    for (var i = 0; i < arrEmi.length; i++) {
        if (arrEmi[i].month.getFullYear() == currYear) {
            currYearPrin += arrEmi[i].emiPrin;
            currYearInt += arrEmi[i].emiInt;
        }
        else {
            dataArr.push([currYear+'', Math.round(currYearInt*100)/100, Math.round(currYearPrin*100)/100]);
            currYear = arrEmi[i].month.getFullYear();
            currYearInt = 0;
            currYearPrin = 0;
        }
    }

    dataArr.push([currYear+'', Math.round(currYearInt*100)/100, Math.round(currYearPrin*100)/100]);
    var data = google.visualization.arrayToDataTable(dataArr);
    var options = {
        title: 'Yearwise Principal & Interest',
        hAxis: {title: 'Year', titleTextStyle: {color: '#336699'}},
        colors:['#336699', '#990134'],
        animation: {
            duration: 500,
            easing: 'linear'
        }
    };

    //var chart = new google.visualization.ColumnChart(colChartDiv);
    colChart.draw(data, options);
}
