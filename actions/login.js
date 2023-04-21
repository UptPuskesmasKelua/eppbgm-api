/* eslint-disable no-await-in-loop */
const { solveCaptcha } = require('./solve_captcha');
const { LoginError } = require('../errors/login_error');
const { CaptchaError } = require('../errors/captcha_error');

const login = async ({
  browser, page, username, password,
}) => {
  console.log('Logging in...');

  await page.goto('https://sigiziterpadu.kemkes.go.id/login_sisfo');
  await page.type('input[name=user]', username);
  await page.type('input[type=password]', password);
  // await page.screenshot({ path: 'images/screenshot.jpg' });

  const captchaResult = await solveCaptcha(browser, page);

  await page.waitForTimeout(1000);

  await page.type('input[name=captcha]', captchaResult);

  // await page.screenshot({ path: 'images/screenshot_captcha.jpg' });

  await page.click('button[type=submit]');

  await page.waitForTimeout('1000');

  // Wait for redirect
  await page.waitForNavigation({
    waitUntil: 'domcontentloaded'
  })

  // Captcha and login Chekcing
  const modalElement = await page.$('#ErrorModal');
  if (modalElement !== null) {
    const modalResult = await page.$eval('.modal-body', (el) => el.innerText);
    console.log(el.innerText);
    if (modalResult === 'Username atau Password salah / User tidak ditemukan !') {
      throw new LoginError('Username atau password tidak cocok.');
    }else{
      throw new CaptchaError('Gagal mendapatkan CAPTCHA, silakan coba lagi.');
    }
  }

  console.log('Done logging in.');
  // page.screenshot({ path: 'images/login_success.jpg'});
};

exports.login = login;
