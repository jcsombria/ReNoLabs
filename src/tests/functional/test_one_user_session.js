const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const {Builder, By, Key, until} = require('selenium-webdriver');
const LabConfig = require('../../config/LabConfig');
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

(async function example() {
  let driver = await new Builder().forBrowser('firefox').build();
  try {
    await driver.get('http://localhost:8080');
    await driver.wait(until.titleIs(LabConfig.info.name), 1000);

    // Log in
    await driver.findElement(By.name('username')).sendKeys('eva')
    await driver.findElement(By.name('password')).sendKeys('bes')
    await driver.findElement(By.tagName('button')).sendKeys('webdriver', Key.RETURN);

    // Start Experience
    await driver.wait(until.titleIs('Circuito Analogico'));
    await driver.get('http://localhost:8080/real');


    await sleep(180000);
  } finally {
    await driver.quit();
  }
})();