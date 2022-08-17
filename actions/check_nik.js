const checkNik = async (page, nik) => {
  console.log('Checking nik...');

  await page.goto(
    `https://sigiziterpadu.kemkes.go.id/ppgbm/index.php/balita/ukur/${nik}.html`,
  );

  const nikInPage = await page.$eval(
    'form > table > tbody > tr > td:nth-of-type(3) > b',
    (el) => el.innerText,
  );
  if (nik === nikInPage) {
    console.log('Done checking nik.');
    return true;
  }

  console.log('Done checking nik.');
  return false;
};

exports.checkNik = checkNik;
