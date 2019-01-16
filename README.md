# Containerize Experiment Stimuli
This software introduces a new method for replicating and sandboxing dynamic and static web content in a high-fidelity way that preserves the dynamism, interactability, and aesthetic quality of the original. The output of this script will include the web content before containerization, the containerized content with support for JS-rendered content, and containzerized content without JS-rendering.

# Features 
- Retrieves source code of static web content
- Retrieves html of JavaScript rendered web content
- Base64 encodes images and gifs
- Embeds CSS and Javascript via [HTMLArk](https://github.com/BitLooter/htmlark)
- Returns false for all content links (creates unclickable links)
- Returns false for all input elements
- Removes white space
- Removes <script> and <iframe> tags 
- Optional: replace links with specified target addresses

## Requirements
- ChromeDriver 2.45 (Supports Chrome v70-72) 
    - Declare the path to the ChromeDriver in contain.py before use
- Windows* 7 or later, macOS, or Linux

## Command-Line Usage 
### Multiple Websites 
If multiple websites are being containerized, the input will be entered via a csv file. The csv not include headers and should be structured as follows:

| website name | URL | optional: link target address |

| facebook | https://www.facebook.com/ | http://www.testingwebsite.com/ |
| ------------- |:-------------:| -----:|
| twitter | https://www.twitter.com/ |
| buzzfeed | https://www.buzzfeed.com/ |
| whatsapp | https://www.whatsapp.com/ | http://www.testingtesting123.com/ | 

If the user does not wish the change the target addresses of the content links, the third column will be left blank.

    git clone https://github.com/gewethor/containerize-experiment-stimuli
    
    python3 contain.py -i [path-to-csv]

### Single Website
If a single website is being containerized, the web address and (optionally) the link target address will be entered in the command-line. 

    git clone https://github.com/gewethor/containerize-experiment-stimuli
    
For containerization with no transformation of content links:
    
    python3 contain.py -u [web address of site]
    
For containerization as well as tranformation of content links:

    python3 contain.py -u [web address of site] -l [link target address]

## License 
containerize-experiment-stimuli is released under the MIT license, which may be found in the LICENSE file
