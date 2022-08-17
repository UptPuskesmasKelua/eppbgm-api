/* eslint-disable no-empty */

const addBalita = async (page, {
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
  // tanggalPengukuran,
  beratBadan,
  tinggiBadan,
  namaOrangTua,
  noWaPelapor,
}) => {
  console.log('Adding balita...');
  await page.goto('https://sigiziterpadu.kemkes.go.id/ppgbm/index.php/balita/baru.html');

  await page.type('input[name="NAMA"]', namaAnak);

  const allJkRadio = await page.$$('input[name="JK"]');
  await allJkRadio[
    (jenisKelamin === 'L' ? 0 : 1)
  ].click();

  await page.type('input[name="OP_VAL"]', `${anakKeBerapa}`);

  await page.type('input[name="KTP"]', nik);

  const tLDate = new Date(tanggalLahir);
  await page.type(
    'input[name="TL"]',
    `${tLDate.getDate()}-${tLDate.getMonth() + 1}-${tLDate.getFullYear()}`,
  );

  await page.click('textarea[name="ALAMAT"]');
  await page.type('textarea[name="ALAMAT"]', alamat);

  await page.type('input[name="RT"]', rt);
  await page.type('input[name="RW"]', rw);

  await page.click('#select2-kel-container');
  await page.type('.select2-search__field', desaKelurahan);
  await page.keyboard.press('Enter');

  await page.type('input[name="BERAT"]', `${beratBadan}`);
  await page.type('input[name="tinggi"]', `${tinggiBadan}`);
  await page.type('input[name="nm_ortu"]', `${namaOrangTua}`);
  await page.type('input[name="telp_hp"]', `${noWaPelapor}`);

  await page.waitForTimeout(1000);

  page.on('dialog', async (dialog) => {
    console.log(dialog);
    await dialog.accept();
  });

  await page.click('button[type=submit]');

  // Outlier meas. check
  const pageUrl = await page.url();
  if (pageUrl.includes('ubah_data')) {
    await page.click('button[type=submit]');
    await page.waitForTimeout(5999);
  }

  await page.waitForTimeout(1000);
  console.log('Done adding balita.');
};

exports.addBalita = addBalita;
