const puppeteer = require('puppeteer');

(async () => {
  function delay(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.ipay.ua/ua/p2p', {waitUntil: 'networkidle2'});

  await page.waitFor('#sender-bank-card');

  await page.$eval('[name="P2pForm[sender_card_pan]"]', el => el.value = '0000000000000000');
  await page.$eval('[name="P2pForm[sender_card_expm]"]', el => el.value = '01');
  await page.$eval('[name="P2pForm[sender_card_expy]"]', el => el.value = '21');
  await page.$eval('[name="P2pForm[sender_card_cvv]"]', el => el.value = '111');
  await page.$eval('[name="P2pForm[sender_phone]"]', el => el.value = '0934444444');
  await page.$eval('[name="P2pForm[invoice]"]', el => el.value = '1');

  await page.$eval('[name="P2pForm[target_card_pan]"]', el => el.value = '1111111111111111');

  await page.click('.go-to-pay');
  await delay(1500);
  await page.waitFor('.go-to-pay');

  await page.screenshot({path: 'example.png'});

  await browser.close();
})();
