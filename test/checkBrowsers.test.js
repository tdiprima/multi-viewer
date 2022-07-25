// Oct 26, 2020
// TODO: npm install selenium-webdriver
const swd = require('selenium-webdriver');
console.log(swd);

const { Builder, By, Key } = require('selenium-webdriver');

async function openIt (url, browser) {
  const driver = await new Builder().forBrowser(browser).build();

  await driver.get(url);

  await driver.findElement(By.name('q')).sendKeys('selenium', Key.RETURN);
}

// Not committing the real url ;)
const url = 'https://google.com';

// Test it in Firefox and Chrome
openIt(url, 'firefox');
openIt(url, 'chrome');
