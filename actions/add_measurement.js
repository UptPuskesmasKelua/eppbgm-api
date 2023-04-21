const { DuplMeasError } = require('../errors/dupl_meas_error');

const addMeasurement = async (page, {
  nik,
  tanggalPengukuran,
  beratBadan,
  tinggiBadan,
}) => {
  console.log('Adding measurement...');
  await page.goto(`https://sigiziterpadu.kemkes.go.id/ppgbm/index.php/balita/ukur/${nik}.html`);

  await page.click('.btn-white');

  await page.waitForTimeout(1000);

  const tangalPenguDate = new Date(tanggalPengukuran);
  console.log(tanggalPengukuran);
  await page.type(
    'input[name="TANGGALUKUR"]',
    `${tangalPenguDate.getDate()}-${tangalPenguDate.getMonth() + 1}-${tangalPenguDate.getFullYear()}`,
  );

  await page.click('input#tb');
  await page.type('input#bb', `${beratBadan}`);
  await page.type('input#tb', `${tinggiBadan}`);

  page.on('dialog', async (dialog) => {
    console.log(dialog);
    await dialog.accept();
  });

  await page.click('button[type=submit]');

  await page.waitForTimeout(1000);

  // page.screenshot({path:'images/measurement.jpg'});

  // Outlier meas. check
  const pageUrl = await page.url();
  if (pageUrl.includes('ubah_data')) {
    await page.click('button[type=submit]');
    await page.waitForTimeout(5999);
  }

  // Duplicate meas. check
  const h1Element = await page.$('h1');
  if (h1Element !== null) {
    if (
      await page.$eval('h1', (el) => el.innerText) === 'A Database Error Occurred'
    ) {
      throw new DuplMeasError('Pengukuran yang sama sudah ada.');
    }
  }

  console.log('Done adding measurement.');
  await page.waitForTimeout(1000);
};

exports.addMeasurement = addMeasurement;
