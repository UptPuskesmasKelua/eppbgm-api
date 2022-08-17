/* eslint-disable no-await-in-loop */
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const { loadImage } = require('canvas');
const predict = require('./teacable-machine-image-nodejs-starter/predict');

const solveCaptcha = async (browser, page) => {
  console.log('Solving captcha...');
  let captchaResultText = '';

  // Teachablemachine model Location
  const DEFAULT_MODEL_LOCATION = `file:///${path.join(`${__dirname}/../`)}/tm_model/model.json`;
  const model = await tf.loadLayersModel(DEFAULT_MODEL_LOCATION);

  // Downloading captcha
  const captchaElement = await page.$('#captcha_id');
  await captchaElement.screenshot({ path: 'captcha.png' });

  // const wtFontPage = await browser.newPage();

  // // Uploading captcha
  // await wtFontPage.goto('https://www.myfonts.com/pages/whatthefont/crop');
  // const [fileChooser] = await Promise.all([
  //   wtFontPage.waitForFileChooser(),
  //   wtFontPage.click('button.wtfDragArea_description_link'),
  // ]);
  // await fileChooser.accept(['captcha.png']);

  // // Crop-all
  // console.log('Cropping captcha...');

  // await wtFontPage.waitForSelector('.wtfTooltip_text');
  // const cropAreaBound = await wtFontPage.$eval(
  //   '.wtfCropArea_image',
  //   (el) => {
  //     const boundingBox = el.getBoundingClientRect();
  //     return {
  //       top: boundingBox.top,
  //       bottom: boundingBox.bottom,
  //       left: boundingBox.left,
  //       right: boundingBox.right,
  //     };
  //   },
  // );

  // const nwBounding = await wtFontPage.$eval(
  //   'div[data-dir="nw"]',
  //   (el) => {
  //     const boundingBox = el.getBoundingClientRect();
  //     return {
  //       x: boundingBox.x,
  //       y: boundingBox.y,
  //     };
  //   },
  // );
  // await wtFontPage.mouse.move(nwBounding.x + 4, nwBounding.y + 4);
  // await wtFontPage.mouse.down();
  // await wtFontPage.mouse.move((cropAreaBound.left) + 10, (cropAreaBound.top) + 5);
  // await wtFontPage.mouse.up();

  // const seBounding = await wtFontPage.$eval(
  //   'div[data-dir="se"]',
  //   (el) => {
  //     const boundingBox = el.getBoundingClientRect();
  //     return {
  //       x: boundingBox.x,
  //       y: boundingBox.y,
  //     };
  //   },
  // );
  // await wtFontPage.mouse.move(seBounding.x + 4, seBounding.y + 4);
  // await wtFontPage.mouse.down();
  // await wtFontPage.mouse.move(cropAreaBound.right - 5, cropAreaBound.bottom - 7);
  // await wtFontPage.mouse.up();

  // // Getting result
  // console.log('Getting captcha result...');

  // await wtFontPage.click('button.wtfCropToolbar_searchButton');
  // await wtFontPage.waitForSelector('.wtfResultList_fontRender > img');
  // const captchaResultSrc = await wtFontPage.$eval(
  //   '.wtfResultList_fontRender > img',
  //   (el) => el.src,
  // );
  // const captchaSrcArray = captchaResultSrc.split('=');
  // const captchaResultText = captchaSrcArray[(captchaSrcArray.length - 1)];

  // await wtFontPage.close();

  // Captcha object detection
  let convertOutput;
  const components = [];
  try {
    await exec(
      'convert captcha.png -crop 287x45+2+2 captcha_cropped.png',
    );
    const { stdout } = await exec(
      // eslint-disable-next-line no-multi-str
      'convert captcha_cropped.png -colorspace gray -negate \
    -threshold 20% -define connected-components:verbose=true \
    -define connected-components:sort=x \
    -connected-components 10 -normalize captcha_masked.png',
    );
    convertOutput = stdout;
    // console.log(stdout);
  } catch (error) {
    console.log(error);
  }
  convertOutput = convertOutput.split(/\r?\n/);
  convertOutput.shift(); convertOutput.pop();
  for (let i = 0; i < convertOutput.length; i += 1) {
    // eslint-disable-next-line prefer-destructuring
    convertOutput[i] = convertOutput[i].trim().split(' ')[1];
    const itemPos = convertOutput[i].split('+');
    const itemSize = itemPos.shift().split('x');
    components[i] = {
      size: itemSize.map((el) => parseInt(el, 10)),
      pos: itemPos.map((el) => parseInt(el, 10)),
    };
  }

  // Captcha letter recognition
  for (let i = 0; i < components.length; i += 1) {
    const component = components[i];
    const width = component.size[0]; const height = component.size[1];
    const x = component.pos[0]; const y = component.pos[1];
    const size = width * height;
    if (size > 50 && size < 250) {
      try {
        await exec(
          `convert captcha_cropped.png -crop ${width + 8}x${height + 12}+${x - 2}+${y - 6} ${i}.png`,
        );
        await exec(
          `convert ${i}.png -resize 224x224 -gravity center -extent 224x224 -background white ${i}.png`,
        );

        const image = await loadImage(path.resolve(__dirname, '..', `${i}.png`));
        const charResult = await predict(image, model);
        // console.log(`Character result ${charResult[0].className}`);

        await exec(`rm ${i}.png`);

        captchaResultText += charResult[0].className;
      } catch (error) {
        console.log(error);
      }
    }
  }

  console.log(`Done solving captcha. result ${captchaResultText}`);
  await page.waitForTimeout(500);
  return captchaResultText;
};

exports.solveCaptcha = solveCaptcha;
