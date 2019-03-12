//Global Variables
var myArgs = process.argv.slice(2);
target = myArgs[0];

var request = require('request');
const fetch = require("node-fetch");
var fs = require('fs')
var sleep = require('sleep');
var fs = require('fs');
var PNG = require('pngjs').PNG;
var pixelmatch = require('pixelmatch');
const sharp = require('sharp');

var divLive;
var divStatic;
var divJS;

var originScriptsLength;
var saveAsScriptsLength;
var studySandboxxStaticScriptsLength;
var studySandboxxJSScriptsLength;

var originNonImageLength;
var saveAsNonImageLength;
var studySandboxxStaticNonImageLength;
var studySandboxxJSNonImageLength;

var originCookiesAmount;
var saveAsCookiesAmount;
var studySandboxxStaticCookiesAmount;
var studySandboxxJSCookiesAmount;

var originInteractivesAmount;
var saveAsInteractivesAmount;
var studySandboxxStaticInteractivesAmount;
var studySandboxxJSInteractivesAmount;

var originIframesAmount;
var saveAsIframesAmount;
var studySandboxxJSIframesAmount;
var studySandboxxStaticIframesAmount;

var saveAsPixelDiff;
var grabzitPixelDiff;
var studySandboxxStaticPixelDiff;
var studySandboxxJSPixelDiff;
var originImgPixelDiff;

var originPNG;
var originresizedPNG;

let promiseSaveAs;
let promiseStatic;
let promiseJS;
let promiseGrabzit;

const {Builder, By, until, logging, webdriver} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

let o = new chrome.Options();
//o.addArguments('auto-open-devtools-for-tabs');
o.addArguments('enablePerformanceLogging');
o.addArguments("--window-size=1920,1080");

var Table = require('cli-table');
var colors = require('colors');

    //Parse Argument
    async function parseArguments() {
        //Run contain.py
        let {PythonShell} = require('python-shell')
        let options = {args: ['-u', myArgs[0]]};

        PythonShell.run('contain.py', options, function (err, results) {
            if (err) throw err;
            });
    }

    async function collectOrigin() {
        let driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(o)
            .build()
        await driver.get(target)
        await driver.sleep(10000);

        //Capture Chrome Developer Tools Network Entries
        let entries = await driver.executeScript("return window.performance.getEntriesByType('resource');");

        //Filter for Network Scripts
        var originScripts = entries.filter(function (el) {
            return el.initiatorType == 'script'
        });

        originScriptsLength = originScripts.length;

        //Filter for non-image files
        var originNonImage = entries.filter(function (el) {
            return el.initiatorType !== 'img'
        });

        originNonImageLength = originNonImage.length;

        //Check for Cookies
        originCookies = driver.manage().getCookies().then(function (cookies) {
            originCookiesAmount = cookies.length;
        });

        let divs = await driver.findElements(By.tagName('div'));
        let random_indices = [];
        let random_elements = [];
        let random_element_coords = [];
        var max_samples = 10;

        while(random_indices.length < max_samples){
            var r = Math.floor(Math.random()*divs.length);
            if(random_indices.indexOf(r) === -1) {
                random_indices.push(r);
                await random_elements.push(divs[r].getAttribute('outerHTML'));
                random_element_coords.push(await divs[r].getRect());
            }
        }

        Promise.all(random_elements).then(function(values) {
        });

        //interactive classes amounts
        var input = await driver.findElements(By.tagName('input'));
        var link = await driver.findElements(By.css(':link'));

        originInteractivesAmount = input.length + link.length;

        //console.log(random_indices);
        //console.log(random_elements);
        //console.log(random_element_coords);

        const source = await driver.getPageSource();
        fs.writeFileSync('source.html', source);
        await driver.sleep(10000);

        //# of iframes
        let iframes = await driver.findElements(By.tagName('iframe'));
        originIframesAmount = iframes.length;

        await driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('origin.png', image, 'base64', function(err) {
                });
            }
        );
        await driver.sleep(10000);
        driver.close();

    }

    async function resizeOrigin() {
        sharp('origin.png').resize({ height: 153, width: 192}).toFile('origin_resized.png')
            .then(function(newFileInfo) {
                console.log("Success");
            })
            .catch(function(err) {
                console.log("Error occured");
            });
        sleep.sleep(10);
    }

    async function collectSaveAs() {
        let driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(o)
            .build()
        var path = require('path');
        //gets your app's root path
        var root = path.dirname(require.main.filename);
        // joins uploaded file path with root. replace filename with your input field name
        var absolutePath = path.join('file://',root,'/source.html');

        await driver.get(absolutePath);
        await driver.sleep(10000);

        let divs = await driver.findElements(By.tagName('div'));
        //console.log(divs);

        let source_elements = [];

        for(let div of divs) {
            html = await div.getAttribute('outerHTML');
            source_elements.push(html);
           // console.log(source_elements);
        }

        //Capture Chrome Developer Tools Network Entries
        let entries = await driver.executeScript("return window.performance.getEntriesByType('resource');");

        //Filter for Network Scripts
        var saveAsScripts = entries.filter(function (el) {
            return el.initiatorType === 'script'
        });

        saveAsScriptsLength = saveAsScripts.length;

        //Filter for non-image files
        var saveAsNonImage = entries.filter(function (el) {
            return el.initiatorType !== 'img'
        });

        saveAsNonImageLength = saveAsNonImage.length;

        //Check for Cookies
        driver.manage().getCookies().then(function (cookies) {
            saveAsCookiesAmount = cookies.length;
        });

        //interactive classes amounts
        var input = await driver.findElements(By.tagName('input'));
        var link = await driver.findElements(By.css(':link'));

        saveAsInteractivesAmount = input.length + link.length;

        //# of iframes
        let iframes = await driver.findElements(By.tagName('iframe'));
        saveAsIframesAmount = iframes.length;

        await driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('saveAs.png', image, 'base64', function(err) {
                });
            }
        );

    driver.close();

    }

    async function metrics_static() {
        let driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(o)
            .build()

        var path = require('path');
        //gets your app's root path
        var root = path.dirname(require.main.filename);
        // joins uploaded file path with root
        var absolutePath = path.join('file://',root,'/contained_static.html');

        await driver.get(absolutePath);
        await driver.sleep(10000);

        let divs = await driver.findElements(By.tagName('div'));
        //console.log(divs);

        let source_elements = [];

        for(let div of divs) {
            html = await div.getAttribute('outerHTML');
            source_elements.push(html);
           // console.log(source_elements);
        }

        //Capture Chrome Developer Tools Network Entries
        let entries = await driver.executeScript("return window.performance.getEntriesByType('resource');");

        //Filter for Network Scripts
        var studySandboxxStaticScripts = entries.filter(function (el) {
            return el.initiatorType == 'script'
        });

        studySandboxxStaticScriptsLength = studySandboxxStaticScripts.length;

        //Filter for non-image files
        var studySandboxxStaticNonImage = entries.filter(function (el) {
            return el.initiatorType !== 'img'
        });

        studySandboxxStaticNonImageLength = studySandboxxStaticNonImage.length;

        //Check for Cookies
        driver.manage().getCookies().then(function (cookies) {
            studySandboxxStaticCookiesAmount = cookies.length;
        });

        //interactive classes amounts
        var input = await driver.findElements(By.tagName('input'));
        var link = await driver.findElements(By.css(':link'));

        studySandboxxStaticInteractivesAmount = input.length + link.length;

        //# of iframes
        let iframes = await driver.findElements(By.tagName('iframe'));
        studySandboxxStaticIframesAmount = iframes.length;

        await driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('static.png', image, 'base64', function(err) {
                });
            }
        );

        driver.close();
    }

    async function metrics_js() {
        let driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(o)
            .build()

        var path = require('path');
        //gets your app's root path
        var root = path.dirname(require.main.filename);
        // joins uploaded file path with root
        var absolutePath = path.join('file://',root,'/contained_js.html');

        await driver.get(absolutePath);
        await driver.sleep(10000);

        let divs = await driver.findElements(By.tagName('div'));
        //console.log(divs);

        let source_elements = [];

        for(let div of divs) {
            html = await div.getAttribute('outerHTML');
            source_elements.push(html);
           // console.log(source_elements);
        }

        //Capture Chrome Developer Tools Network Entries
        let entries = await driver.executeScript("return window.performance.getEntriesByType('resource');");

        //Filter for Network Scripts
        var studySandboxxJSScripts = entries.filter(function (el) {
            return el.initiatorType == 'script'
        });

        studySandboxxJSScriptsLength = studySandboxxJSScripts.length;

        //Filter for non-image files
        var studySandboxxJSNonImage = entries.filter(function (el) {
            return el.initiatorType !== 'img'
        });

        studySandboxxJSNonImageLength = studySandboxxJSNonImage.length;

        //Check for Cookies
        await driver.manage().getCookies().then(function (cookies) {
            studySandboxxJSCookiesAmount = cookies.length;
        });

        //interactive classes amounts
        var input = await driver.findElements(By.tagName('input'));
        var link = await driver.findElements(By.css(':link'));

        studySandboxxJSInteractivesAmount = input.length + link.length;

        //# of iframes
        let iframes = await driver.findElements(By.tagName('iframe'));
        studySandboxxJSIframesAmount = iframes.length;

        await driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('JS.png', image, 'base64', function(err) {
                });
            }
        );

        driver.close();
    }

    // Run Grabzit
    async function grabzit() {
        var grabzit = require('grabzit');
        // replace with GrabIt Application Key and Secret
        var client = new grabzit("", "");
        client.url_to_image(myArgs[0]);
        client.save_to("grabzit.png", function (error, id){
            if (error != null){
                throw error;
            }
        });
    }

    async function saveAsImgCompare() {
        var originPNG = await fs.createReadStream('origin.png').pipe(new PNG()).on('parsed', doneReading);
        var saveAsPNG = await fs.createReadStream('saveAs.png').pipe(new PNG()).on('parsed', doneReading);
        filesRead = 0;

        async function doneReading() {
            if (++filesRead < 2) return;
            var diff = new PNG({width: originPNG.width, height: originPNG.height});

            diff.pack().pipe(fs.createWriteStream('saveAs_diff.png'));
            var numDiffPixels =  pixelmatch(originPNG.data, saveAsPNG.data, diff.data, originPNG.width, originPNG.height, {threshold: 0.1});
            var totalPixels = 1920 * 1080;
            saveAsPixelDiff = (numDiffPixels / totalPixels).toFixed(2) * 100;
            console.log(saveAsPixelDiff);

           let promiseSaveAs = new Promise((resolve, reject) => {
                setTimeout(() => resolve("done!"), 1000)
           });
           let result = await promiseSaveAs; // wait till the promise resolves (*)

        };

    }

    async function studySandboxxStaticImgCompare() {
        var originPNG = await fs.createReadStream('origin.png').pipe(new PNG()).on('parsed', doneReading);
        var staticPNG = await fs.createReadStream('static.png').pipe(new PNG()).on('parsed', doneReading);
            filesRead = 0;

        async function doneReading() {
            if (++filesRead < 2) return;
            var diff = new PNG({width: originPNG.width, height: originPNG.height});

            diff.pack().pipe(fs.createWriteStream('static_diff.png'));
            var numDiffPixels =  pixelmatch(originPNG.data, staticPNG.data, diff.data, originPNG.width, originPNG.height, {threshold: 0.1});
            var totalPixels = 1920 * 1080;
            studySandboxxStaticPixelDiff = (numDiffPixels / totalPixels).toFixed(2) * 100;
            console.log(studySandboxxStaticPixelDiff);

            let promiseStatic = new Promise((resolve, reject) => {
                setTimeout(() => resolve("done!"), 1000)
            });
            let result = await promiseStatic; // wait till the promise resolves (*)

        };

    }

    async function studySandboxxJSImgCompare() {
        var originPNG = await fs.createReadStream('origin.png').pipe(new PNG()).on('parsed', doneReading);
        var JSPNG = await fs.createReadStream('JS.png').pipe(new PNG()).on('parsed', doneReading);
            filesRead = 0;

        async function doneReading() {
            if (++filesRead < 2) return;
            var diff = new PNG({width: originPNG.width, height: originPNG.height});

            diff.pack().pipe(fs.createWriteStream('JS_diff.png'));
            var numDiffPixels = pixelmatch(originPNG.data, JSPNG.data, diff.data, 1920, 1080, {threshold: 0.1});
            var totalPixels = 1920 * 1080;
            studySandboxxJSPixelDiff = (numDiffPixels / totalPixels).toFixed(2) * 100;
            console.log(studySandboxxJSPixelDiff);

        };

        let promiseJS = new Promise((resolve, reject) => {
            setTimeout(() => resolve("done!"), 1000)
        });
        let result = await promiseJS; // wait till the promise resolves (*)

    }

    async function grabzitImgCompare() {
        var originresizedPNG = await fs.createReadStream('origin_resized.png').pipe(new PNG()).on('parsed', doneReading);
        var grabzitPNG = await fs.createReadStream('grabzit.png').pipe(new PNG()).on('parsed', doneReading);
            filesRead = 0;

        async function doneReading() {
            if (++filesRead < 2) return;
            var diff = new PNG({width: originresizedPNG.width, height: originresizedPNG.height});

            diff.pack().pipe(fs.createWriteStream('grabzit_diff.png'));
            var numDiffPixels = pixelmatch(originresizedPNG.data, grabzitPNG.data, diff.data, 192, 153, {threshold: 0.1});
            var totalPixels = 192 * 153;
            grabzitPixelDiff = (numDiffPixels / totalPixels).toFixed(2) * 100;
            console.log(grabzitPixelDiff);

        };

        let promiseGrabzit = new Promise((resolve, reject) => {
            setTimeout(() => resolve("done!"), 1000)
        });
        let result = await promiseGrabzit; // wait till the promise resolves (*)

    }

    async function outputTable() {
        var table = new Table({
            head: ['Metrics', colors.green("Origin") , colors.cyan('"Save As"'), colors.blue('GrabZit'), colors.yellow('Study-Sandboxx (JS Rendered)'), colors.magenta('Study-Sandboxx (Static)')],
            colWidths: [60, 25, 25, 25, 30, 25],
            style : {compact : true, 'padding-left' : 1}
        });

        table.push(
            ['Fidelity'],
            [],
            ['pixel difference %', '0%', String(saveAsPixelDiff) + '%', String(grabzitPixelDiff) + '%', String(studySandboxxJSPixelDiff) + '%', String(studySandboxxStaticPixelDiff) + '%'],
            ['interactive elements', String(originInteractivesAmount), String(saveAsInteractivesAmount), '0', String(studySandboxxJSInteractivesAmount), String(studySandboxxStaticInteractivesAmount)],
            [],
            ['Security'],
            [],
            ['# of running scripts', String(originScriptsLength), String(saveAsScriptsLength), '0', String(studySandboxxJSScriptsLength), String(studySandboxxStaticScriptsLength)],
            ['# of non-image http requests for third party sources', String(originNonImageLength), String(saveAsNonImageLength), '0', String(studySandboxxJSNonImageLength), String(studySandboxxStaticNonImageLength)],
            [],
            ['Privacy'],
            [],
            ['# of cookies', String(originCookiesAmount), String(saveAsCookiesAmount), '0', String(studySandboxxJSCookiesAmount), String(studySandboxxStaticCookiesAmount)],
            ['# of iframes', String(originIframesAmount), String(saveAsIframesAmount), '0', String(studySandboxxJSIframesAmount), String(studySandboxxStaticIframesAmount)],
        );

        console.log(table.toString());

    }

async function execute() {
    await parseArguments();
    await collectOrigin();
    await resizeOrigin();
    await collectSaveAs();
    await metrics_static();
    await metrics_js();
    await grabzit();
    await saveAsImgCompare();
    await Promise.all([promiseSaveAs]).then(studySandboxxStaticImgCompare());
    await Promise.all([promiseStatic]).then(studySandboxxJSImgCompare());
    await Promise.all([promiseJS]).then(grabzitImgCompare());
    await Promise.all([promiseJS]).then(outputTable());
    await grabzitImgCompare();
}

execute();

