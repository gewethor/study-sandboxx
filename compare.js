/**
 * @Author: Gabi Wethor and Matt Hale
 * @Date:   2019-03-12T12:49:05-05:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: test.js
 * @Last modified by:   matthale
 * @Last modified time: 2019-03-12T13:54:42-05:00
 * @Copyright: Copyright (C) 2018 Matthew L. Hale
 */


//Global Variables
var myArgs = process.argv.slice(2);
target = myArgs[0];

var fs = require('fs')
var sleep = require('sleep');
var PNG = require('pngjs').PNG;
var pixelmatch = require('pixelmatch');
const sharp = require('sharp');
var path = require('path');

var saveAsPixelDiff;
var grabzitPixelDiff;
var studySandboxxStaticPixelDiff;
var studySandboxxJSPixelDiff;


const {Builder, By} = require('selenium-webdriver');
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

    console.log('Sandboxing the content...')
    PythonShell.run('contain.py', options, function (err, results) {
        if (err) {
          console.log("Error Running Contain.py:", err, "results from python", results)
        };
    });

    console.log('...done.')
}

async function collectOrigin() {
    console.log('Observing origin content to tabulate normal behavior...')
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(o)
        .build()
    await driver.get(target)
    await driver.sleep(10000);

    //Capture Chrome Developer Tools Network Entries
    let entries = await driver.executeScript("return window.performance.getEntriesByType('resource');");

    //Filter for Network Scripts
    var scripts = entries.filter(function (el) {
        return el.initiatorType == 'script'
    });

    let num_of_scripts = scripts.length;

    //Filter for non-image files
    var non_image_resources = entries.filter(function (el) {
        return el.initiatorType !== 'img'
    });

    let num_non_image_resources = non_image_resources.length;

    //Check for Cookies
    let num_of_cookies = 0;
    let origin_cookies = driver.manage().getCookies().then(function (cookies) {
         num_of_cookies = cookies.length;
         console.log("origin cookies: " + num_of_cookies);
    });

    //interactive classes amounts
    var input = await driver.findElements(By.tagName('input'));
    var link = await driver.findElements(By.css(':link'));

    let num_of_interactives = input.length + link.length;

    const source = await driver.getPageSource();
    fs.writeFileSync('source.html', source);

    //# of iframes
    let iframes = await driver.findElements(By.tagName('iframe'));
    let num_of_iframes = iframes.length;

    await driver.takeScreenshot().then(
        function(image, err) {
            console.log("Screenshotting Origin: ")
            fs.writeFileSync('origin.png', image, 'base64');
            console.log("...done")
        }
    );
    driver.quit();
    console.log('origin...done.')

    return [num_of_scripts, num_non_image_resources, num_of_cookies, num_of_interactives, num_of_iframes];
}

async function computeMetrics(type, path_to_html) {
    console.log("Computing Metrics for "+type+"...")
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(o)
        .build()

    // joins uploaded file path with root
    var absolutePath = path_to_html;

    await driver.get(absolutePath);
    await driver.sleep(10000);

    let divs = await driver.findElements(By.tagName('div'));

    //Capture Chrome Developer Tools Network Entries
    let entries = await driver.executeScript("return window.performance.getEntriesByType('resource');");

    //Filter for Network Scripts
    var all_scripts = entries.filter(function (el) {
        return el.initiatorType == 'script'
    });

    let num_of_scripts = all_scripts.length;

    //Filter for non-image files
    var non_images = entries.filter(function (el) {
        return el.initiatorType !== 'img'
    });

    let num_non_image_resources = non_images.length;

    //Check for Cookies
    let num_of_cookies;
    await driver.manage().getCookies().then(function (cookies) {
        num_of_cookies = cookies.length;
    });

    //interactive classes amounts
    var inputs = await driver.findElements(By.tagName('input'));
    var links = await driver.findElements(By.css(':link'));

    let num_of_interactives = inputs.length + links.length;

    //# of iframes
    let iframes = await driver.findElements(By.tagName('iframe'));
    let num_of_iframes = iframes.length;

    await driver.takeScreenshot().then(
        function(image, err) {
            console.log("Screenshotting "+type+ ":")
            fs.writeFileSync(type+'.png', image, 'base64');
            console.log("...done")
        }
    );

    driver.quit();
    console.log("...done computing metrics for "+type+".");
    return [num_of_scripts, num_non_image_resources, num_of_cookies, num_of_interactives, num_of_iframes];
}

// Run Grabzit
async function grabzit() {
    //Run grabzit.py
    let {PythonShell} = require('python-shell')
    let options = {args: ['-u', myArgs[0]]};

    console.log('Sandboxing the content...')
    PythonShell.run('grabzit.py', options, function (err, results) {
        if (err) {
          console.log("Error Running grabzit.py:", err, "results from python", results)
        };
    });

    console.log('...done running grabzit.')
    sleep.sleep(5);
}

async function saveAsImgCompare() {
    var originPNG = await fs.createReadStream('origin.png').pipe(new PNG()).on('parsed', doneReading);
    var saveAsPNG = await fs.createReadStream('saveAs.png').pipe(new PNG()).on('parsed', doneReading);
    filesRead = 0;

    async function doneReading() {
        try {
            if (++filesRead < 2) return;
            var diff = new PNG({width: originPNG.width, height: originPNG.height});

            diff.pack().pipe(fs.createWriteStream('saveAs_diff.png'));
            var numDiffPixels =  pixelmatch(originPNG.data, saveAsPNG.data, diff.data, originPNG.width, originPNG.height, {threshold: 0.1});
            var totalPixels = 1920 * 1080;
            saveAsPixelDiff = (numDiffPixels / totalPixels).toFixed(2) * 100;
        }
        catch (err) {
            Bounce.rethrow(err, 'system');
        }
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

    };

}

async function execute() {
    await grabzit();
    var root = path.dirname(require.main.filename);

    await parseArguments();
    let [origin_num_of_scripts, origin_num_non_image_resources, origin_num_of_cookies, origin_num_of_interactives, origin_num_of_iframes] = await collectOrigin();

    // computing metrics for save_as files
    let [saveas_num_of_scripts, saveas_num_non_image_resources, saveas_num_of_cookies, saveas_num_of_interactives, saveas_num_of_iframes] = await computeMetrics("saveAs", path.join('file://',root,'/source.html'));

    // computing metrics for js files
    let [js_num_of_scripts, js_num_non_image_resources, js_num_of_cookies, js_num_of_interactives, js_num_of_iframes] = await computeMetrics("JS", path.join('file://',root,'/contained_js.html'));

    // computing metrics for static files
    let [static_num_of_scripts, static_num_non_image_resources, static_num_of_cookies, static_num_of_interactives, static_num_of_iframes] = await computeMetrics("static", path.join('file://',root,'/contained_static.html'));

    await saveAsImgCompare();
    await studySandboxxStaticImgCompare();
    await studySandboxxJSImgCompare();
    setTimeout(function(){
        var table = new Table({
            head: ['Metrics', colors.green("Origin") , colors.cyan('"Save As"'), colors.blue('GrabZit'), colors.yellow('Study-Sandboxx (JS Rendered)'), colors.magenta('Study-Sandboxx (Static)')],
            colWidths: [60, 25, 25, 25, 30, 25],
            style : {compact : true, 'padding-left' : 1}
        });

        table.push(
            ['Fidelity'],
            [],
            ['pixel difference %', '0%', String(saveAsPixelDiff) + '%', '0%', String(studySandboxxJSPixelDiff) + '%', String(studySandboxxStaticPixelDiff) + '%'],
            ['interactive elements', String(origin_num_of_interactives), String(saveas_num_of_interactives), '0', String(js_num_of_interactives), String(static_num_of_interactives)],
            [],
            ['Security'],
            [],
            ['# of running scripts', String(origin_num_of_scripts), String(saveas_num_of_scripts), '0', String(js_num_of_scripts), String(static_num_of_scripts)],
            ['# of non-image http requests for third party sources', String(origin_num_non_image_resources), String(saveas_num_non_image_resources), '0', String(js_num_non_image_resources), String(static_num_non_image_resources)],
            [],
            ['Privacy'],
            [],
            ['# of cookies', String(origin_num_of_cookies), String(saveas_num_of_cookies), '0', String(js_num_of_cookies), String(static_num_of_cookies)],
            ['# of iframes', String(origin_num_of_iframes), String(saveas_num_of_iframes), '0', String(js_num_of_iframes), String(static_num_of_iframes)],
        );
        console.log(table.toString());
    }, 10000)


}

execute();
