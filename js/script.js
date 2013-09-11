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

$(document).ready(function() {
    //$("#repaymenTable")
    var emiArray = null;
    $('#btnCalculate').click(function(event){
        var prin = parseFloat($('#inpPrinRemain').val());
        var emi = parseFloat($('#inpEmi').val());
        var interest = parseFloat($('#inpInterest').val());
        var startDate = $('#inpStartDate').val();
        var startMonth = startDate.slice(0,2);
        var startYear = startDate.slice(2);

        //Error check for negative amortization
        if (prin * interest*0.01/12 >= emi) {
            $('.errorMsg span').html('Negative Amortization... EMI has to be more than ' +
                                          (prin * interest*0.01/12).toFixed(2) + '. Try again with sane values!');
            var a = $('.errorMsg').show();
            $('.userBody').hide();
            return;
        }
        else {
            $('.errorMsg span').html('');
            $('.errorMsg').hide();
        }
        $(".userBody").show();
//        event.preventDefault();
        var $tb = $('#repaymentTable table tbody');
//        var emiMonthArray = calculateLoanSchedule(2290889, 22489, 10.25, 1);
        var emiMonthArray = calculateLoanSchedule(prin, emi, interest, new Date(startYear, startMonth - 1, 1));
        emiArray = emiMonthArray;
        //emiMonthArray[2] = null;
        displayTable($tb, emiMonthArray);
/*

        $('#repaymentTable tbody tr').click(function(event) {
            //alert(this.rowIndex);
//            alert(emiArray[this.rowIndex - 1].principalRem.toFixed(2));
            //Toggle active class
            var l_nArrIndex = this.rowIndex - 1;
            $(this).toggleClass('active');
            $('#labelMonthNumber').html(l_nArrIndex + 1);
            $('#labelMonth').html(month_names[emiArray[l_nArrIndex].month.getMonth()] + " "
                                  + emiArray[l_nArrIndex].month.getFullYear());
            $('#inpChangeEMI').val(emiArray[l_nArrIndex].emi.toFixed(2));
            $('#inpChangeInterest').val(emiArray[l_nArrIndex].roi.toFixed(2));
            $('#inpChangeAddPrePayment').val(emiArray[l_nArrIndex].prePayment.toFixed(2));
            $('#inpChangeAddLoan').val(emiArray[l_nArrIndex].addLoan.toFixed(2));
            $('#dataChangeModal').modal('toggle');
//            $(this).toggleClass('active');
        });*/

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
        var l_sMsg = recalculateLoanSchedule(emiArray);
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
        var l_sMsg = recalculateLoanSchedule(emiArray);
        if (l_sMsg != "") {
            alert(l_sMsg);
        }
        var $tb = $('#repaymentTable table tbody');
        $('#dataChangeModal').modal('toggle')
        displayTable($tb, emiArray);
/*        $('#repaymentTable tbody tr').click(function(event) {
            var l_nArrIndex = this.rowIndex - 1;
            $(this).toggleClass('active');
            $('#labelMonthNumber').html(l_nArrIndex + 1);
            $('#labelMonth').html(month_names[emiArray[l_nArrIndex].month.getMonth()] + " "
                                  + emiArray[l_nArrIndex].month.getFullYear());
            $('#inpChangeEMI').val(emiArray[l_nArrIndex].emi.toFixed(2));
            $('#inpChangeInterest').val(emiArray[l_nArrIndex].roi.toFixed(2));
            $('#inpChangeAddPrePayment').val(emiArray[l_nArrIndex].prePayment.toFixed(2));
            $('#inpChangeAddLoan').val(emiArray[l_nArrIndex].addLoan.toFixed(2));
            $('#dataChangeModal').modal('toggle');
        });*/
        
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


    $('.pull-down').each(function() {
        $(this).css('margin-top', $(this).parent().height()-$(this).height());
    });
    //Add a demo calculation (Default values)

    $('#inpPrinRemain').val('1000000');
    $('#inpEmi').val('13494');
    $('#inpInterest').val('10.5');
    $('#inpStartDate').val('012013');
    $('#btnCalculate').click(); //Simulate click



});

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
        var l_nArrIndex = this.rowIndex - 1;
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
//                   'width':100%,//325,
                   'height':300,
                   'is3D': true};

    // Instantiate and draw our chart, passing in some options.
//    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    var chart = new google.visualization.PieChart($('#chart_div')[0]);
    chart.draw(data, options);

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
    /*for (var i = 1; i < 20; i++) {
        dataArr.push([2004 + i + '', 100 + i * 10, 400 + i * 5]);
//        dataArr[i][0] = 2004 + i;
//        dataArr[i][1] = 100 + i * 10;
//        dataArr[i][2] = 400 + i * 5;
    }*/

    var data = google.visualization.arrayToDataTable(dataArr);
    /*

    var data = google.visualization.arrayToDataTable([
        ['Year', 'Sales', 'Expenses'],
        ['2004',  1000,      400],
        ['2005',  1170,      460],
        ['2006',  660,       1120],
        ['2007',  1030,      540]
    ]); */

    var options = {
        title: 'Yearwise Principal & Interest',
        hAxis: {title: 'Year', titleTextStyle: {color: 'red'}}
    };

    var chart = new google.visualization.ColumnChart(colChartDiv);
    chart.draw(data, options);
}
