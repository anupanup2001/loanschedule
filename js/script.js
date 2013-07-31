//var totPrinPaid = 0;
//var totIntPaid = 0;
$(document).ready(function() {
    //$("#repaymenTable")
    $('.btn').click(function(event){
        $("#repaymentTable").slideDown(1000);
        event.preventDefault();

    });

});
var displayTable = function(prin, emi, roi, startDate) {
    var arr = calculateLoanSchedule(2290889, 22489, 10.25, 1);

    var strTableData = "";

    for (var i = 0; i < arr.length; i++) {
        strTableData += "<tr>";
        strTableData += "<td>" + (i + 1) + "</td>";
        strTableData += "<td>" + arr[i].principalRem.toFixed(2) + "</td>";
        strTableData += "<td>" + arr[i].emiPrin.toFixed(2) + "</td>";
        strTableData += "<td>" + arr[i].emiInt.toFixed(2) + "</td>";
        strTableData += "<td>" + "Jan 2013" + "</td>";
        strTableData += "</tr>";
    }
    
    document.write(strTableData);
    var totPrinPaid = 0;
    var totIntPaid = 0;
    for(var i = 0; i < arr.length; i++) {
        totPrinPaid += arr[i].emiPrin;
        totIntPaid += arr[i].emiInt;
    }

    // Load the Visualization API and the piechart package.
    google.load('visualization', '1.0', {'packages':['corechart']});

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
                       'width':400,
                       'height':300,
                       'is3D': true};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }



};

