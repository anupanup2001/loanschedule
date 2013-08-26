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
    $('#btnCalculate').click(function(event){
        var prin = parseFloat($('#inpPrinRemain').val());
        var emi = parseFloat($('#inpEmi').val());
        var interest = parseFloat($('#inpInterest').val());
        var startDate = $('#inpStartDate').val();
        var startMonth = startDate.slice(0,2);
        var startYear = startDate.slice(2);

        //Error check for negative amortization
        if (prin * interest*0.01/12 >= emi) {
            $('.inputForm .errorMsg').html('Negative Amortization... EMI has to be more than ' +
                                          (prin * interest*0.01/12).toFixed(2) + '. Try again with sane values!');
            $('.userBody').hide();
            return;
        }
        else {
            $('.inputForm .errorMsg').html('');
        }
        $(".userBody").show();
//        event.preventDefault();
        var $tb = $('#repaymentTable table tbody');
//        var emiMonthArray = calculateLoanSchedule(2290889, 22489, 10.25, 1);
        var emiMonthArray = calculateLoanSchedule(prin, emi, interest, new Date(startYear, startMonth - 1, 1));
        displayTable($tb, emiMonthArray);

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



});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var displayTable = function(elem, arr) {
    //var arr = calculateLoanSchedule(2290889, 22489, 10.25, 1);

    var strTableData = "";

    for (var i = 0; i < arr.length; i++) {
        strTableData += "<tr>";
        strTableData += "<td>" + (i + 1) + "</td>";
        strTableData += "<td>" + arr[i].principalRem.toFixed(2) + "</td>";
        strTableData += "<td>" + arr[i].emiPrin.toFixed(2) + "</td>";
        strTableData += "<td>" + arr[i].emiInt.toFixed(2) + "</td>";
        strTableData += "<td>" + month_names[arr[i].month.getMonth()] + " " +
            arr[i].month.getFullYear() + "</td>";
        strTableData += "</tr>";
    }
    
//    document.write(strTableData);
    elem.html(strTableData);
//    
//elem.text(strTableData);
    var strLastEmiInfo = 'No. of months: ' + arr.length + ' Last EMI is <span class="emphasize">' + month_names[arr[arr.length - 1].month.getMonth()] + " " +
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
                   'width':325,
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
