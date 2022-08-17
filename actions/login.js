/* eslint-disable no-await-in-loop */
const { solveCaptcha } = require('./solve_captcha');
const { LoginError } = require('../errors/login_error');
const { CaptchaError } = require('../errors/captcha_error');

const login = async ({
  browser, page, username, password,
}) => {
  console.log('Logging in...');

  await page.goto('https://sigiziterpadu.kemkes.go.id/login_sisfo/');
  await page.type('input[name=user]', username);
  await page.type('input[type=password]', password);

  const captchaResult = await solveCaptcha(browser, page);

  await page.waitForTimeout(1000);

  await page.type('input[name=captcha]', captchaResult);

  await page.click('button[type=submit]');

  await page.waitForTimeout('1000');

  // Captcha and login Chekcing
  const modalElement = await page.$('.modal-body');
  if (modalElement !== null) {
    const modalResult = await page.$eval('.modal-body', (el) => el.innerText);
    if (modalResult === 'Captha tidak sesuai/salah !') {
      throw new CaptchaError('Gagal mendapatkan CAPTCHA, silakan coba lagi.');
    }
    if (modalResult === 'Username atau Password salah / User tidak ditemukan !') {
      throw new LoginError('Username atau password tidak cocok.');
    }
  }

  console.log('Done logging in.');
};

exports.login = login;
