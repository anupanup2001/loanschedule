var webdriver = require('selenium-webdriver');
var assert = require('assert');

var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build();
driver.manage().window().maximize();
driver.get('http://localhost:8888/loanplanner');

webdriver.promise.controlFlow().on('uncaughtException', function(e) {
 console.error('Unhandled error: ' + e);
});

function fillInputsWith(prinRem, emi, interest) {
    var d = webdriver.promise.defer();
    driver.findElement(webdriver.By.name('inpPrinRemain')).clear();
    driver.findElement(webdriver.By.name('inpPrinRemain')).sendKeys(prinRem);
    driver.findElement(webdriver.By.name('inpEmi')).clear();
    driver.findElement(webdriver.By.name('inpEmi')).sendKeys(emi);
    driver.findElement(webdriver.By.name('inpInterest')).clear();
    driver.findElement(webdriver.By.name('inpInterest')).sendKeys(interest).then(function() {
        d.fulfill(true);
    });
    return d.promise;
}

function clickCalculate() {
    var d = webdriver.promise.defer();
    driver.findElement(webdriver.By.name('btnCalculate')).click().then(function() {
        //driver.sleep(1000);
        d.fulfill(true);
    });
    return d.promise;
}

function seesAnErrorMessage() {
    var d = webdriver.promise.defer();
    driver.findElement(webdriver.By.className('errorMsg')).isDisplayed().then(function(value){
        if (value) {
            driver.findElement(webdriver.By.css('.errorMsg span')).getText().then(function(text) {
                d.fulfill(text);
            });
        }
        else {
            d.reject(new Error("Alert is not visible on page"));
        }
    });
    return d.promise;
}

function seesNoErrorMessage() {
    var d = webdriver.promise.defer();
    driver.findElement(webdriver.By.className('errorMsg')).isDisplayed().then(function(value) {
        if (!value) {
            d.fulfill(true);
        }
        else {
            d.reject(new Error("Alert is still visible!"));
        }
    });
}

function isTotalAmtPaid(l_fAmt) {
    var d = webdriver.promise.defer();
    driver.findElement(webdriver.By.id('totPrinPlusIntMsg')).getText().
        then(function(val) {
            assert.equal(val, l_fAmt);
            return true;
        });
    return d.promise;
}

function isPrinAmtPaid(l_fAmt) {
    var d = webdriver.promise.defer();
    driver.findElement(webdriver.By.id('totPrinMsg')).getText().
        then(function(val) {
            assert.equal(val, l_fAmt);
            return true;
        });
    return d.promise;
}
//Test 1: Principal is mandatory

fillInputsWith("", "22489", "10.25")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "Principal Remaining field is mandatory");
    })
    .then(function(){
        console.log("Test 1: Passed");
    },function(err){
        console.error("Test 1: Failed " + err)
    });

//Test 2: EMI is mandatory

fillInputsWith("2290889", "", "10.25")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "EMI field is mandatory");
    })
    .then(function(){
        console.log("Test 2: Passed");
    },function(err){
        console.error("Test 2: Failed " + err)
    });

//Test 3: Interest is mandatory

fillInputsWith("2290889", "22489", "")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "Interest field is mandatory");
    })
    .then(function(){
        console.log("Test 3: Passed");
    },function(err){
        console.error("Test 3: Failed " + err)
    });

//Test 4: All Inputs are empty

fillInputsWith("", "", "")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "All input fields are mandatory");
    })
    .then(function(){
        console.log("Test 4: Passed");
    },function(err){
        console.error("Test 4: Failed " + err)
    });

//Test 5: All inputs are proper (happy case)

fillInputsWith("2290889", "22489", "10.25")
    .then(clickCalculate)
    .then(seesNoErrorMessage)
    .then(function(){
        console.log("Test 5: Passed");
    },function(err){
        console.error("Test 5: Failed " + err)
    });

//Test 6: Principal Rem is not numeric

fillInputsWith("Abc65A", "22489", "10.25")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "Principal Remaining is not numeric");
    })
    .then(function(){
        console.log("Test 6: Passed");
    },function(err){
        console.error("Test 6: Failed " + err)
    });

//Test 7: EMI is not numeric

fillInputsWith("2290889", "224r89", "10.25")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "EMI is not numeric");
    })
    .then(function(){
        console.log("Test 7: Passed");
    },function(err){
        console.error("Test 7: Failed " + err)
    });

//Test 8: Interest is not numeric

fillInputsWith("2290889", "22489", "aa10.*25")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "Interest is not numeric");
    })
    .then(function(){
        console.log("Test 8: Passed");
    },function(err){
        console.error("Test 8: Failed " + err)
    });

//Test 9: Principal Rem is negative

fillInputsWith("-2290889", "22489", "10.25")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "Principal Remaining should be positive");
    })
    .then(function(){
        console.log("Test 9: Passed");
    },function(err){
        console.error("Test 9: Failed " + err)
    });

//Test 10: EMI is negative

fillInputsWith("2290889", "-22489", "10.25")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "EMI should be positive");
    })
    .then(function(){
        console.log("Test 10: Passed");
    },function(err){
        console.error("Test 10: Failed " + err)
    });


//Test 11: Interest is negative

fillInputsWith("2290889", "22489", "-10.25")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "Interest should be positive");
    })
    .then(function(){
        console.log("Test 11: Passed");
    },function(err){
        console.error("Test 11: Failed " + err)
    });

//Test 12: Interest is above 100%

fillInputsWith("2290889", "22489", "1025")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(msg){
        assert.equal(msg, "Interest should be less than 100%");
    })
    .then(function(){
        console.log("Test 12: Passed");
    },function(err){
        console.error("Test 12: Failed " + err)
    });
//Test 13: An error is shown when EMI is less and negative amortization

fillInputsWith("2290889","22", "10.25")
    .then(clickCalculate)
    .then(seesAnErrorMessage)
    .then(function(val) {
        assert.equal(val, "Negative Amortization... EMI has to be more than 19568.01");
    })
    .then(function(){
        console.log("Test 13: Passed");
    },function(err){
        console.error("Test 13: " + err);
    });

//Test 14: When EMI is greater than principal, proper value should be calculated

fillInputsWith("1000", "1500", "10")
    .then(clickCalculate)
    .then(seesNoErrorMessage)
    .then(function(){
        isTotalAmtPaid("1,008.33");
    })
    .then(function(){
        isPrinAmtPaid("1,000")
    })
    .then(function(){
        console.log("Test 14: Passed");
    },function(err){
        console.error("Test 14: Failed " + err);
    });
driver.quit();