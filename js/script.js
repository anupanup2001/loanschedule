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
    $('.btn').click(function(event){
        
        $("#repaymentTable").slideDown(1000);
        event.preventDefault();

    });

    var $tb = $('#repaymentTable table tbody');
    var emiMonthArray = calculateLoanSchedule(2290889, 22489, 10.25, 1);
    displayTable($tb, emiMonthArray);

});
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
    var strLastEmiInfo = "Last EMI is <span>" + month_names[arr[arr.length - 1].month.getMonth()] + " " +
        arr[arr.length-1].month.getFullYear() + "</span>";
    $("#lastEmiInfo div h3").html(strLastEmiInfo);
    
    var totPrinPaid = 0;
    var totIntPaid = 0;
    for(var i = 0; i < arr.length; i++) {
        totPrinPaid += arr[i].emiPrin;
        totIntPaid += arr[i].emiInt;
    }

    // Load the Visualization API and the piechart package.
    

    // Set a callback to run when the Google Visualization API is loaded.
    google.setOnLoadCallback(drawChart);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    function drawChart() {

        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Repayment Component');
        data.addColumn('number', 'Rupee');
        data.addRows([
            ['Principal', Math.ceil(totPrinPaid * 100)/100],
            ['Interest', Math.ceil(totIntPaid * 100)/100]
        ]);

        // Set chart options
        var options = {'title':'Total Loan Repayment Components',
                       'width':350,
                       'height':300,
                       'is3D': true};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }

};

