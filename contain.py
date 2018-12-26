import urllib.request
import htmlark
from time import sleep
import pandas as pd
import argparse
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

parser = argparse.ArgumentParser()
parser.add_argument('-i', '-input', '-csvfile', type=argparse.FileType('r'), help='Input csv file', dest='csvfile', required=False)
parser.add_argument('-u', '-url', type=str, help='url of target webpage', dest='url', required=False)
parser.add_argument('-l', '-links', type=str, help='target url to replace content links', dest='links', required=False)
args = parser.parse_args()

def csvparse():
    target = pd.read_csv(args.csvfile, names=['col0', 'col1'], encoding='ISO-8859-1')
    cols = target.columns.values
    for idx, line in enumerate(target[cols[0]]):
        if line != None:
            print(line)
            #grab html
            #urllib.request.urlretrieve(line, "{}_source.html".format(idx))
            webdriver_path = '/Users/gabiwethor/PycharmProjects/Python3_Projects/chromedriver'
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--window-size=1920x1080')
            browser = webdriver.Chrome(executable_path=webdriver_path, options=chrome_options)
            browser.get(line)
            pagesource = (browser.page_source).encode('utf-8')
            sleep(10)
            html = open("{}_source.html".format(idx), "w", encoding="utf-8")
            html.write(str(pagesource))
            html.close()

            sleep(5)

            #inline html
            inlinedhtml = htmlark.convert_page("{}_source.html".format(idx), ignore_errors=True)

            #remove whitespace
            inlinedhtml = ' '.join(inlinedhtml.split())

            #make all links unclickable
            soup = BeautifulSoup(inlinedhtml, features="html.parser")
            for a in range(len(soup('a'))):
                soup('a')[a]["onclick"] = "return false;"
            for p in range(len(soup('input'))):
                soup('input')[p]["onclick"] = "return false;"

            #remove script tags
            for script in soup("script"):
                soup.script.extract()

            #remove all iframe tags
            for iframe in soup("iframe"):
                soup.iframe.extract()

            if target[cols[1]][idx] != None:
                for a in soup.findAll('a'):
                    a['href'] = str(target[cols[1]][idx])
                    print(str(target[cols[1]][idx]))

            #output sandboxed html
            with open("{}_inlined.html".format(idx), "w") as file:
                file.write(str(soup))
            file.close()

def singlesite():
    urllib.request.urlretrieve(args.url, "source.html")
    sleep(10)

    # inline html
    inlinedhtml = htmlark.convert_page("source.html", ignore_errors=True)

    # remove whitespace
    inlinedhtml = ' '.join(inlinedhtml.split())

    # make all links unclickable
    soup = BeautifulSoup(inlinedhtml, features="html.parser")
    for i in range(len(soup('a'))):
        soup('a')[i]["onclick"] = "return false;"
    for i in range(len(soup('input'))):
        soup('input')[i]["onclick"] = "return false;"

    # remove script tags
    for script in soup("script"):
        soup.script.extract()

    # remove all iframe tags
    for iframe in soup("iframe"):
        soup.iframe.extract()

    if args.links:
        for a in soup.findAll('a'):
            a['href'] = str(args.links)
        print(str(args.links))

    # output sandboxed html
    with open("inlined.html", "w") as file:
        file.write(str(soup))

if args.csvfile:
    csvparse()
elif args.url:
    singlesite()
else:
    print("Please provide website url or csv file")