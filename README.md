# Containerize Experiment Stimuli
This software introduces a new method for replicating and sandboxing dynamic and static web content in a high-fidelity way that preserves the dynamism, interactability, and aesthetic quality of the original. The output of this script will include the web content before containerization, the containerized content with support for JS-rendered content, and containzerized content without JS-rendering.

# Features 
* Retrieves source code of static web content
* Retrieves html of JavaScript rendered web content
* Base64 encodes images and gifs
* Embeds CSS and Javascript via [HTMLArk](https://github.com/BitLooter/htmlark)
* Escape all links and input elements without affecting interactivity
* Removes white space
* Removes <script> and <iframe> tags 
* Removes HTML attributes allowing .ico file requests
* Optional: replace links with specified target addresses

## Requirements
* [ChromeDriver](http://chromedriver.chromium.org/downloads) Version 2.46
    * Must declare the path to the ChromeDriver in contain.py before use
* Windows, MacOS, or Linux or OS acceptable

## Installation
```
sudo apt-get install python3
sudo apt-get install python3-pip
pip3 install HTMLArk
pip3 install selenium
pip3 install argparse
pip3 install beautifulsoup4
pip3 install urllib3
pip3 install pandas
git clone https://github.com/gewethor/containerize-experiment-stimuli
```
## Getting started
### Configuring Path to web driver
Within the contain.py script, the Chrome Driver needs to be in PATH. On lines 23 and 141, change the following to include the PATH to chomedriver.exe

```cs
webdriver_path = '' #Replace with chrome webdriver path
```

### Basic usage - Single Website
To sandbox and encapsulate a single website simply:

```
python3 contain.py -u [web address of site]
```

Example
```
python3 contain.py -u https://www.facebook.com
```
[Output](docs/basic_usage)
    
### Modifying embedded links in the content
If a single website is being containerized, the web address and (optionally) the link target address will be entered in the command-line.

For containerization as well as transformation of content links:

```
python3 contain.py -u [web address of site] -l [link target address]
```

Example:
```
python3 contain.py -u https://www.facebook.com -l http://www.anothersite.com/
```
[Output](docs/single_modifying_links)  

### Multiple Websites 
If multiple websites are being containerized, the input will be entered via a csv file. The csv not include headers and should be structured as follows:

| website name | URL | optional: link target address |

| facebook | https://www.facebook.com/ | http://www.testingwebsite.com/ |
| ------------- |:-------------:| -----:|
| github | https://github.com/ |
| dropbox | https://www.dropbox.com/home |
 
If the user does not wish the change the target addresses of the content links, the third column will be left blank.

Example:
```
python3 contain.py -i [path-to-csv]
```
[Output](docs/multiple_usage) 

# Testing Study-Sandboxx
For usability purposes, the JS-rendered and static Study-Sandboxx processes can be easily and directly compared against other common techniques researchers use when running studies with websites from the wild. This testing component compares our sandboxing approach against using the live site, saving the website locally using "Save As" with the format "Webpage, HTML Only", and [Grabzit](https://grabz.it/api/) a tool used to capture and convert webpages. 

## Testing Metrics
Each of the containerization techniques are compared using six testing metrics categorized into three groups; fidelity, security, and privacy.

* Fidelity
    * The percent of pixel difference between a screenshot of the origin website and a screenshot of website acquired using each of the content techniques 
    * The total amount of interactive elements within each webpage
* Security
    * The number of running scripts within the browser
    * The number of non-image http requests for third party sources
* Privacy
    * The number of cookies from the origin website
    * The number of running iframes


## Installation
```
npm install request
npm install sleep
npm install pixelmatch
npm install sharp
pip3 install GrabzIt
npm install cli-table
npm install colors
npm install python-shell
```
## Requirements 
In order to run the script, a free account with [Grabzit](https://grabz.it/api/) must be created so an application key and "secret" are generated. The application key and "secret" must be declared in the grabzit.py file.

## Usage
To run the testing script:
```
node compare.js [target webpage]
```
Example: 
```
node compare.js https://www.facebook.com
```

[Output](docs/testing_output/compare_output.png) 

## License 
containerize-experiment-stimuli is released under the MIT license, which may be found in the LICENSE file
