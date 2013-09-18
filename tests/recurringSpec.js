var webdriver = require('selenium-webdriver');

var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build();
driver.manage().window().maximize();
driver.get('http://localhost:8888');

function fillStandardInputs() {
    var d = webdriver.promise.defer();
    driver.findElement(webdriver.By.name('inpPrinRemain')).clear();
    driver.findElement(webdriver.By.name('inpPrinRemain')).sendKeys("2290889");
    driver.findElement(webdriver.By.name('inpInterest')).clear();
    driver.findElement(webdriver.By.name('inpInterest')).sendKeys("10.25");
    driver.findElement(webdriver.By.name('inpEmi')).clear();
    driver.findElement(webdriver.By.name('inpEmi')).sendKeys("22489");
    driver.findElement(webdriver.By.name('inpStartDate')).clear();
    driver.findElement(webdriver.By.name('inpStartDate')).click().then(function() {
        var month = driver.findElement(webdriver.By.className('ui-datepicker-month'));
        month.click();
        month.findElement(webdriver.By.css("option[value='0']")).click();
        //driver.sleep(5000);
        driver.findElement(webdriver.By.css('button.ui-datepicker-close')).click();
        //driver.sleep(5000);
        /*var allOptions = month.findElements(webdriver.By.tagName('option'));
        console.log(allOptions.length);
        
        
        for (var i = 0; i < allOptions.length; i++) {
            if (allOptions[i].getAttribute('value') == "0") {
                option.click();
                d.fulfill(true);
                break;
            }
            console.log(allOptions[i].getAttribute('value'));
        }*/
    });
    driver.findElement(webdriver.By.name('btnCalculate')).click().then(function() {
        driver.sleep(3000);
        var l_tableRow1 = driver.findElement(webdriver.By.css("#repaymentTable tr:first-child"));
        new webdriver.ActionSequence(driver).mouseMove(l_tableRow1).click(l_tableRow1).perform();
        driver.sleep(3000);
        d.fulfill(true);
    });
    return d.promise;
}

fillStandardInputs().then(function() {
    driver.sleep(5000);
});


driver.quit();