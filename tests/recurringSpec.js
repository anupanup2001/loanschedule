var webdriver = require('selenium-webdriver');

var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build();
driver.manage().window().maximize();
driver.get('http://localhost:8888');

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

function clickRowNumber(nRow) {
    var d = webdriver.promise.defer();
    driver.findElement(webdriver.By.css("#repaymentTable tr:nth-child(" + nRow + ")")).click()
        .then(function() {
            d.fulfill(true);
        });
    return d.promise;
}
/*
driver.findElement(webdriver.By.name('btnCalculate')).click().then(function() {
    driver.sleep(3000);
    //var l_tableRow1 = driver.findElement(webdriver.By.css("#repaymentTable tr:first-child"));
    var l_tableRow1 = driver.findElement(webdriver.By.css("#repaymentTable tr:nth-child(50)"));
    new webdriver.ActionSequence(driver).mouseMove(l_tableRow1).click(l_tableRow1).perform();
    driver.sleep(3000);
    d.fulfill(true);
});
return d.promise;
*/


fillInputsWith("2290889", "22489", "10.25")
    .then(clickCalculate);
clickRowNumber(20)
    .then(function() {
        driver.sleep(5000);
    });


driver.quit();