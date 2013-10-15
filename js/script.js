//var totPrinPaid = 0;
//var totIntPaid = 0;

var month_names = [];
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
var g_report = {};
g_report.arrUndo = [];
$(document).ready(function() {
    //$("#repaymenTable")
    var emiArray = [];
    $('#btnCalculate').click(function(event){
        emiArray = calculateReport();
        //GA track Goal Calculate
        _gaq.push(['_trackEvent', 'Calculate', 'Click']);
        /*
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
        $('#inpPrinRemain').select(); */
    });
  
    $('#dataChangeModal').on('hidden.bs.modal', function () {
        //Toggle highlighting of selected row
        var l_nRowId = parseInt($('#labelMonthNumber').text());
        $('#repaymentTable tbody tr:nth-child(' + l_nRowId + ')').removeClass('active');
        $('#dataChangeModal input').removeClass('green');
    });
    
    $('#dataChangeModal').on('shown.bs.modal', function () {
        $('#inpChangeEMI').focus();
        $('#inpChangeEMI').select(); 
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
        $('#dataChangeModal').modal('toggle');
        displayTable($tb, emiArray);

    });

    
    $('#btnChangeSave').click(function() {
        _gaq.push(['_trackEvent', 'ModifiedTable', 'Changed']);
        var l_cEMIChange = 1;
        var l_cInterestChange = 2;
        var l_cPrePaymentChange = 4;
        var l_cAddLoanChange = 8;

        var l_changeFlag = 0;
        var l_nIndex = parseInt($('#labelMonthNumber').text() - 1);
        //Save old values for Undo Information
        var l_oldValues = {
            changed: emiArray[l_nIndex].changed,
            emi: emiArray[l_nIndex].emi,
            roi: emiArray[l_nIndex].roi,
            prePayment: emiArray[l_nIndex].prePayment,
            addLoan: emiArray[l_nIndex].addLoan,
        };
        l_changeFlag = emiArray[l_nIndex].changed;
        //Check if any value changed
        var l_bModified = false;
        if (emiArray[l_nIndex].emi.toFixed(2) != $('#inpChangeEMI').val()) {
            _gaq.push(['_trackEvent', 'ModifiedEMI', 'Changed']);
            l_changeFlag = l_changeFlag | l_cEMIChange;
            emiArray[l_nIndex].emi = parseFloat($('#inpChangeEMI').val());
            l_bModified = true;
        }
        
        if (emiArray[l_nIndex].roi.toFixed(2) != $('#inpChangeInterest').val()) {
            _gaq.push(['_trackEvent', 'ModifiedInterest', 'Changed']);
            l_changeFlag = l_changeFlag | l_cInterestChange;
            emiArray[l_nIndex].roi = parseFloat($('#inpChangeInterest').val());
            l_bModified = true;
        }
        
        //if (parseFloat($('#inpChangeAddPrePayment').val()) != 0) {
        if (emiArray[l_nIndex].prePayment.toFixed(2) != $('#inpChangeAddPrePayment').val()) {
            _gaq.push(['_trackEvent', 'ModifiedPrePay', 'Changed']);
            l_changeFlag = l_changeFlag | l_cPrePaymentChange;
            emiArray[l_nIndex].prePayment = parseFloat($('#inpChangeAddPrePayment').val());
            l_bModified = true;
        }

        //if (parseFloat($('#inpChangeAddLoan').val()) != 0) {
        if (emiArray[l_nIndex].addLoan.toFixed(2) != $('#inpChangeAddLoan').val()) {
            _gaq.push(['_trackEvent', 'ModifiedAddLoan', 'Changed']);
            l_changeFlag = l_changeFlag | l_cAddLoanChange;
            emiArray[l_nIndex].addLoan = parseFloat($('#inpChangeAddLoan').val());
            l_bModified = true;
        }
        
        //If no modifications, return.
        if (!l_bModified) {
            return;
        }
        emiArray[l_nIndex].changed = l_changeFlag;
        
        //Save new values for undo information
        var l_newValues = {
            changed: emiArray[l_nIndex].changed,
            emi: emiArray[l_nIndex].emi,
            roi: emiArray[l_nIndex].roi,
            prePayment: emiArray[l_nIndex].prePayment,
            addLoan: emiArray[l_nIndex].addLoan,
        };
        
        var l_undoObject = {
            nIndex: l_nIndex,
            oldValues: l_oldValues,
            newValues: l_newValues
        };
        
        g_report.arrUndo.push(l_undoObject);
        
        var l_nInitialEMI = parseFloat($('#inpEmi').val());
        var l_nInitialInterest = parseFloat($('#inpInterest').val());
        var l_nInitialPrincipal = parseFloat($('#inpPrinRemain').val());
        var l_sMsg = recalculateLoanSchedule(emiArray, l_nInitialPrincipal, l_nInitialInterest, l_nInitialEMI);
        if (l_sMsg !== "") {
            alert(l_sMsg);
        }
        var $tb = $('#repaymentTable table tbody');
        $('#dataChangeModal').modal('toggle');
        displayTable($tb, emiArray);
    });

    //Configure datePicker
    $('.date-picker').datepicker( {
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        dateFormat: 'M yy',
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
    
    $('#dataChangeModal input').keypress(function(e) {
        if (e.which == 13) {
            $('#btnChangeSave').focus().click();
            //$(this).focus().select();
        }
    });
    //Add a demo calculation (Default values)

    $('#inpPrinRemain').val('1000000');
    $('#inpEmi').val('13494');
    $('#inpInterest').val('10.5');
    $('#inpStartDate').val('Jan 2013');
    emiArray = calculateReport();
    g_report.emiArray = emiArray;
    //$('#btnCalculate').click(); //Simulate click
    
    $('#demoVideoModal').on('shown.bs.modal', function() {
        _gaq.push(['_trackEvent', 'DemoVideo', 'Click']);
        var $video = $('.demoVideoContainer iframe');
        var l_nWidth = $(".demoVideoContainer").width();
        $video.width(l_nWidth).height(l_nWidth/1.33);
        
    });
    $('#surveyModal').on('shown.bs.modal', function () {
        _gaq.push(['_trackEvent', 'Survey', 'Click']);
    });
    
    $('#btnUndoAllModifications').click(function() {
        _gaq.push(['_trackEvent', 'UndoAllMod', 'Click']);
        for (var i = 0; i < emiArray.length; i++) {
            emiArray[i].changed = 0;
            emiArray[i].prePayment = 0;
            emiArray[i].addLoan = 0;
        }
        var l_nInitialEMI = parseFloat($('#inpEmi').val());
        var l_nInitialInterest = parseFloat($('#inpInterest').val());
        var l_nInitialPrincipal = parseFloat($('#inpPrinRemain').val());
        var l_sMsg = recalculateLoanSchedule(emiArray, l_nInitialPrincipal, l_nInitialInterest, l_nInitialEMI);
        var $tb = $('#repaymentTable table tbody');
        displayTable($tb, emiArray);
    });
  
    //Recaptcha functionality for feedback
    $('#inpEmailMessage').focusin(function() {
        if ($('#captcha').text() === "") {
            showRecaptcha("captcha", null);
        }
    });
    $('#btnSendEmail').click(sendEmail);
    attachTooltipEvents();
    
    //fade the table initially to avoid confusing users
    $('#haze').fadeTo(1000,0.3);
    //Unhide the surveyPop a few seconds after user clicks calculate
    $('#btnCalculate').click(function(){
      $('#surveyPop').delay(20000).slideDown(500);
      $('#haze').fadeTo(1000,1);
      $('#modMsg').delay(5000).effect("shake", {times:2, distance:10}, 1000);
    });
    
    
    
});

function setTooltipOptions() {
    
    $('[data-toggle="tooltip"]').tooltip({
        animation:true,
        trigger:'manual',
        placement: function(){
            if ($(window).width() <= 1200) {
                return  "bottom";
            }
            else {
                return "top";
            }
        }
    });
    
}

function attachTooltipEvents() {
    var l_newTooltipShown = false;
    setTooltipOptions();
    
    $('#inpPrinRemain').on('keydown', function(){
        if (l_newTooltipShown === false) {
            $('[data-toggle="tooltip"]:not(#inpEmi)').tooltip('hide');
            $('#inpEmi').tooltip('show');
        }
        l_newTooltipShown = true;
    });
    
    $('#inpPrinRemain').on('click', function(){
        $('[data-toggle="tooltip"]:not(#inpEmi)').tooltip('hide');
        $('#inpEmi').tooltip('show');
    });
    
    $('#inpEmi').on('focus', function(){
       
        $('[data-toggle="tooltip"]:not(#inpInterest)').tooltip('hide');
        $('#inpInterest').tooltip('show');
        l_newTooltipShown = false;
       
    });
    
    $('#inpInterest').on('focus', function(){
        
        $('[data-toggle="tooltip"]:not(#inpStartDate)').tooltip('hide');
        $('#inpStartDate').tooltip('show');
        
    });
    
    $('#inpStartDate').on('focus', function(){
        
        $('[data-toggle="tooltip"]:not(#btnCalculate)').tooltip('hide');
        $('#btnCalculate').tooltip('show');
    });
    
    $('#btnCalculate').on('click', function(){
        //if (l_newTooltipShown === false) {
        $('[data-toggle="tooltip"]:not(#repaymentTableHeader)').tooltip('hide');
        //$('#repaymentTableHeader').tooltip('show');
        
    });
    
    $('#inpPrinRemain').tooltip('show');
    
}
function sendEmail() {
    //Get user parameters
    var l_strName = $('#inpEmailName').val();
    var l_strEmail = $('#inpEmailAddress').val();
    var l_strMessage = $('#inpEmailMessage').val();
    if (l_strMessage === '') {
        $('#alertEmailMsg').removeClass('alert-success').addClass('alert-danger').text("Empty feedback. Try again");
        return;
    }
    
    $('#alertEmailMsg').removeClass('alert-success').addClass('alert-danger').text("Please wait... Sending feedback.");
    $('#btnSendEmail').attr("disabled", "disabled");
    var postParams = {
        challenge: Recaptcha.get_challenge(),
        response: Recaptcha.get_response(),
        name: l_strName,
        email: l_strEmail,
        message: l_strMessage
    };
    jQuery.post("/sendEmail", postParams, 
            function(data) {
                //Recaptcha.destroy();
                if(data.replace(/\n/g, " ").split(" ")[0] == "true") {
                    //Captcha successful
                    $('#alertEmailMsg').removeClass('alert-danger').addClass('alert-success').text("Email Sent successfully!");
                    Recaptcha.destroy();
                    showRecaptcha('captcha', null);
                    //Clear inputs
                    $('#inpEmailName').val('');
                    $('#inpEmailAddress').val('');
                    $('#inpEmailMessage').val('');
                }
                else {
                    //Captcha unsuccessful or mail error.
                    if (data.replace(/\n/g, " ").split(" ")[1] == "Error:") {
                        //Mail sending error
                        $('#alertEmailMsg').removeClass('alert-success').addClass('alert-danger').text("Please try again later. " + data.replace(/\n/g, "^").split("^")[1]);
                        Recaptcha.destroy();
                        showRecaptcha('captcha', null);
                    }
                    else {
                        $('#alertEmailMsg').removeClass('alert-success').addClass('alert-danger').text("Please enter captcha again. Error: " + data.replace(/\n/g, " ").split(" ")[1]);
                        Recaptcha.destroy();
                        showRecaptcha('captcha', null);
                        //alert(data.replace(/\n/g, " ").split(" ")[1]);
                    }
                }
                $('#btnSendEmail').removeAttr("disabled");
    
            });
}

function showRecaptcha(element, error) {
    var l_strErr = '';
    if (error !== null && error !== '') {
        l_strErr = '&error=' + error;
        //alert(l_strErr);
    }
    Recaptcha.create("6LeMFugSAAAAAJT7AmGQ8eoR3XsKI4gWLSVaXP5A", element, {
        theme: "clean",
        callback: null,//Recaptcha.focus_response_field,
        extra_challenge_params: l_strErr
    });
}
/*
This function is responsible for calculating the entire report on page
Table, pie diagram and chart diagram is populated.
*/
function calculateReport() {
    var l_sPrin = $('#inpPrinRemain').val();
    var l_sEmi = $('#inpEmi').val();
    var l_sInterest = $('#inpInterest').val();
    var l_sMsg = validateInputs(l_sPrin, l_sEmi, l_sInterest);
    setErrorMsg(l_sMsg);
    if (l_sMsg !== "") {
        return;
    }
    

    var prin = parseFloat(l_sPrin);
    var emi = parseFloat(l_sEmi);
    var interest = parseFloat(l_sInterest);
    var startDate = $('#inpStartDate').val();
    var startMonth = month_names.indexOf(startDate.slice(0,3));
    var startYear = startDate.slice(4);
    //var startMonth = startDate.slice(0,2);
    //var startYear = startDate.slice(2);

    var $tb = $('#repaymentTable table tbody');
    var emiMonthArray = calculateLoanSchedule(prin, emi, interest, new Date(startYear, startMonth, 1));
    g_report.origTotAmount = calculateTotalAmount(emiMonthArray);
    g_report.origTotMonths = emiMonthArray.length;
    //alert(g_report.origTotAmount);
    //emiMonthArray;
    
    // Instantiate and draw our chart, passing in some options.
    pieChart = new google.visualization.PieChart($('#chart_div')[0]);
    colChart = new google.visualization.ColumnChart($('#bar_chart_div')[0]);
    displayTable($tb, emiMonthArray);
    //Set focus to first input
    $('#inpPrinRemain').focus();
    $('#inpPrinRemain').select();
    return emiMonthArray;
}

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
        return l_sRet;
    }
    if(emi.match(/^-/)) {
        l_sRet = "EMI should be positive";
        return l_sRet;
    }
    if(interest.match(/^-/)) {
        l_sRet = "Interest should be positive";
        return l_sRet;
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
    if (msg === '') {
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
        $('#labelMonth').html(month_names[arr[l_nArrIndex].month.getMonth()] + " " +
                               arr[l_nArrIndex].month.getFullYear());
        $('#inpChangeEMI').val(arr[l_nArrIndex].emi.toFixed(2));
        $('#inpChangeInterest').val(arr[l_nArrIndex].roi.toFixed(2));
        $('#inpChangeAddPrePayment').val(arr[l_nArrIndex].prePayment.toFixed(2));
        $('#inpChangeAddLoan').val(arr[l_nArrIndex].addLoan.toFixed(2));
        $('#dataChangeModal').modal('toggle');
        //Hide shown tooltip if any
        $('[data-toggle="tooltip"]').tooltip('hide');        
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
    //$("#lastEmiInfo div h4 .message").html(strLastEmiInfo);
    //$('#totEmiMonthsMsg').text(arr.length);
    $('#totLastEmiMsg').text(month_names[arr[arr.length - 1].month.getMonth()] + ' ' + arr[arr.length-1].month.getFullYear());
    
    var totPrinPaid = 0;
    var totIntPaid = 0;
    for(i = 0; i < arr.length; i++) {
        totPrinPaid += arr[i].emiPrin;
        totIntPaid += arr[i].emiInt;
    }

    //Fill in total message below PI diagram chart

    $("#totPrinMsg").text(numberWithCommas(Math.round(totPrinPaid*100)/100));
    $("#totIntMsg").text(numberWithCommas(Math.round(totIntPaid*100)/100));
    $("#totPrinPlusIntMsg").text(numberWithCommas(Math.round((totPrinPaid + totIntPaid)*100)/100));
    var l_nTotPrePay = getTotalPrepay(arr);
    $("#totPrePaymentMsg").text(numberWithCommas(Math.round((l_nTotPrePay) * 100)/100));
    
    if (l_nTotPrePay > 0) {
        $("#totPrePaymentMsg").addClass('green');
    }
    else {
        $("#totPrePaymentMsg").removeClass('green');
    }
    if (g_report.origTotAmount > 0) {
        var l_fSaving = Math.round((g_report.origTotAmount - totPrinPaid - totIntPaid)*100)/100;
        $("#totSaveMsg").text(numberWithCommas(l_fSaving));
        if (l_fSaving > 0) {
            $('#totSaveMsg').addClass('green');
        }
        else {
            $('#totSaveMsg').removeClass('green');
        }
    }
    var l_nSaveMonths = g_report.origTotMonths - arr.length;
    
    if (l_nSaveMonths === 0) {
        $('#totEmiMonthsMsg').text(arr.length);
        $('#totEmiMonthsMsg').removeClass('green');
    }
    else if (l_nSaveMonths < 0) {
        $('#totEmiMonthsMsg').text(arr.length + " (+" + (0 - l_nSaveMonths) + ")");
        $('#totEmiMonthsMsg').removeClass('green');
        $('#totLastEmiMsg').removeClass('green');
    }
    else {
        $('#totEmiMonthsMsg').addClass('green');
        $('#totLastEmiMsg').addClass('green');
        $('#totEmiMonthsMsg').text(arr.length + " (" + (0 - l_nSaveMonths) + ")");
    }
    var l_strSaveMonths = '';
    if (l_nSaveMonths >= 12){
        l_strSaveMonths = Math.floor(l_nSaveMonths/12) + " yr, " + l_nSaveMonths % 12 + " mnth";
    }
    else {
        l_strSaveMonths = l_nSaveMonths + " month(s)";
    }
    $("#totMonthsSaveMsg").text(l_strSaveMonths);
    if (l_nSaveMonths > 0) {
        $('#totMonthsSaveMsg').addClass('green');
    }
    else {
        $('#totMonthsSaveMsg').removeClass('green');
    }
    
    

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
                   //'height':230,
                   'is3D': true,
                   'colors':['#990134', '#336699'],
                   'titleTextStyle':{
        'fontSize':12
    }
                  
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
        //height: 230,
        hAxis: {title: 'Year', titleTextStyle: {color: '#336699'}},
        colors:['#990134', '#336699'],
        animation: {
            duration: 1000,
            easing: 'linear'
        },
        'titleTextStyle':{
            'fontSize':12
        }
    };

    //var chart = new google.visualization.ColumnChart(colChartDiv);
    colChart.draw(data, options);
};
