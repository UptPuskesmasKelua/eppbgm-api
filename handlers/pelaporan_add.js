/* eslint-disable no-await-in-loop */
const puppeteer = require('puppeteer');
const { login } = require('../actions/login');
const { CaptchaError } = require('../errors/captcha_error');
const { LoginError } = require('../errors/login_error');
const { checkNik } = require('../actions/check_nik');
const { addBalita } = require('../actions/add_balita');
const { addMeasurement } = require('../actions/add_measurement');

const pelaporanAdd = async (request, h) => {
  const {
    username,
    password,
    namaAnak,
    jenisKelamin,
    anakKeBerapa,
    nik,
    tanggalLahir,
    alamat,
    rt,
    rw,
    // provinsi,
    // kabupatenKota,
    // kecamatan,
    desaKelurahan,
    tanggalPengukuran,
    beratBadan,
    tinggiBadan,
    namaOrangTua,
    noWaPelapor,
  } = request.payload;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();

  // Logging in
  // eslint-disable-next-line no-unreachable-loop
  // eslint-disable-next-line no-constant-condition
  try {
    await login({
      browser, page, username, password,
    });
    await page.waitForTimeout('1000');
  } catch (error) {
    if (error instanceof CaptchaError) {
      await browser.close();
      return h.response({
        statusCode: 403,
        error: 'Forbidden',
        message: error.message,
      }).code(403);
    }
    if (error instanceof LoginError) {
      await browser.close();
      return h.response({
        statusCode: 401,
        error: 'Unauthorized',
        message: error.message,
      }).code(401);
    }
    await browser.close();
    return h.response({
      statusCode: 500,
      error: 'Internal Server Error',
      message: error.message,
    }).code(500);
  }

  // NIK Checking
  let isBalitaExist;
  try {
    isBalitaExist = await checkNik(page, nik);
  } catch (error) {
    await browser.close();
    return h.response({
      statusCode: 500,
      error: 'Internal Server Error',
      message: error.message,
    }).code(500);
  }

  if (isBalitaExist) {
    // Adding measurement if NIK exists
    try {
      await addMeasurement(page, {
        nik, tanggalPengukuran, beratBadan, tinggiBadan,
      });
      await browser.close();
      return h.response({
        statusCode: 202,
        error: false,
        message: 'Pengukuran berhasil ditambahkan',
        data: {
          isBalitaBaru: false,
        },
      }).code(202);
    } catch (error) {
      await browser.close();
      return h.response({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message,
      }).code(400);
    }
  }
  // Adding a new balita by form
  try {
    await addBalita(page, {
      namaAnak,
      jenisKelamin,
      anakKeBerapa,
      nik,
      tanggalLahir,
      alamat,
      rt,
      rw,
      desaKelurahan,
      beratBadan,
      tinggiBadan,
      namaOrangTua,
      noWaPelapor,
    });
    await browser.close();
    return h.response({
      statusCode: 202,
      error: false,
      message: 'Balita berhasil ditambahkan',
      data: {
        isBalitaBaru: true,
      },
    }).code(202);
  } catch (error) {
    await browser.close();
    return h.response({
      statusCode: 503,
      error: 'Service Unavailable',
      message: error.message,
    }).code(503);
  }
};

exports.pelaporanAdd = pelaporanAdd;
