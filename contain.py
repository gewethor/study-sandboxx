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

def csvparsejs(target):
    # target = pd.read_csv(args.csvfile, names=['col0', 'col1', 'col2'], encoding='ISO-8859-1')
    cols = target.columns.values
    for idx, line in enumerate(target[cols[1]]):
        if line != None:
            try:
                print("containerizing {}".format(line))
                print("containerizing js rendered html")
                #collect html
                webdriver_path = '/Users/gabiwethor/PycharmProjects/Python3_Projects/chromedriver'
                chrome_options = Options()
                chrome_options.add_argument('--headless')
                chrome_options.add_argument('--window-size=1920x1080')
                browser = webdriver.Chrome(executable_path=webdriver_path, options=chrome_options)
                browser.get(line)
                pagesource = browser.page_source.encode('utf-8')
                sleep(10)
                html = open("{}_source_js.html".format(str(target[cols[0]][idx])), "w", encoding="utf-8")
                html.write(str(pagesource))
                html.close()

                sleep(5)
                inlinedhtml = htmlark.convert_page("{}_source_js.html".format(str(target[cols[0]][idx])), ignore_errors=True)

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

                #replace links
                if target[cols[2]][idx] != None:
                    for a in soup.findAll('a'):
                        a['href'] = str(target[cols[2]][idx])
                        print(str(target[cols[2]][idx]))

                #output sandboxed html
                with open("{}_inlined_js.html".format(str(target[cols[0]][idx])), "w") as file:
                    file.write(str(soup))
                file.close()
                print("js rendered html of {} successfully containerized".format(line))
            except:
                print("{} containerization process failed, continuing to next webpage".format(line))
                continue
    return 0

def csvparsestatic(target2):
    # target2 = pd.read_csv(args.csvfile, names=['col0', 'col1', 'col2'], encoding='ISO-8859-1')
    cols = target2.columns.values
    for idx2, line2 in enumerate(target2[cols[1]]):
        if line2 != None:
            try:
                urllib.request.urlretrieve(line2, "{}_source.html".format(str(target2[cols[0]][idx2])))
                sleep(5)
                inlinedhtml = htmlark.convert_page("{}_source.html".format(str(target2[cols[0]][idx2])), ignore_errors=True)

                # remove whitespace
                inlinedhtml = ' '.join(inlinedhtml.split())

                # make all links unclickable
                soup = BeautifulSoup(inlinedhtml, features="html.parser")
                for a in range(len(soup('a'))):
                    soup('a')[a]["onclick"] = "return false;"
                for p in range(len(soup('input'))):
                    soup('input')[p]["onclick"] = "return false;"

                # remove script tags
                for script in soup("script"):
                    soup.script.extract()

                # remove all iframe tags
                for iframe in soup("iframe"):
                    soup.iframe.extract()

                #replace links
                if target2[cols[2]][idx2] != None:
                    for a in soup.findAll('a'):
                        a['href'] = str(target2[cols[2]][idx2])
                        print(str(target2[cols[2]][idx2]))

                # output sandboxed html
                with open("{}_inlined.html".format(str(target2[cols[0]][idx2])), "w") as file:
                    file.write(str(soup))
                file.close()
                print("{} successfully containerized static html".format(line2))
            except:
                print("{} containerization process failed, continuing to next webpage".format(line2))
                continue

def singlesitejs():
    print("containerizing {}".format(args.url))
    try:
        print("containerizing js rendered html")
        # collect html
        webdriver_path = '/Users/gabiwethor/PycharmProjects/Python3_Projects/chromedriver'
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--window-size=1920x1080')
        browser = webdriver.Chrome(executable_path=webdriver_path, options=chrome_options)
        browser.get(args.url)
        pagesource = browser.page_source.encode('utf-8')
        sleep(10)
        html = open("source.html", "w", encoding="utf-8")
        html.write(str(pagesource))
        html.close()

        sleep(5)
        inlinedhtml = htmlark.convert_page("source.html", ignore_errors=True)

        # remove whitespace
        inlinedhtml = ' '.join(inlinedhtml.split())

        # make all links unclickable
        soup = BeautifulSoup(inlinedhtml, features="html.parser")
        for a in range(len(soup('a'))):
            soup('a')[a]["onclick"] = "return false;"
        for p in range(len(soup('input'))):
            soup('input')[p]["onclick"] = "return false;"

        # remove script tags
        for script in soup("script"):
            soup.script.extract()

        # remove all iframe tags
        for iframe in soup("iframe"):
            soup.iframe.extract()

        #replace links
        if args.links:
            for a in soup.findAll('a'):
                a['href'] = str(args.links)
            print(str(args.links))

        # output sandboxed html
        with open("inlined.html", "w") as file:
            file.write(str(soup))
        file.close()
        print("js rendered html of {} successfully containerized".format(args.url))
    except:
        print("containerization of js rendered html from {} failed".format(args.url))
        pass

def singlesitestatic():
    try:
        urllib.request.urlretrieve(args.url, "source.html")
        sleep(5)

        inlinedhtml = htmlark.convert_page("source.html", ignore_errors=True)

        # remove whitespace
        inlinedhtml = ' '.join(inlinedhtml.split())

        # make all links unclickable
        soup = BeautifulSoup(inlinedhtml, features="html.parser")
        for a in range(len(soup('a'))):
            soup('a')[a]["onclick"] = "return false;"
        for p in range(len(soup('input'))):
            soup('input')[p]["onclick"] = "return false;"

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
        file.close()
        print("static html of {} successfully containerized".format(args.url))
    except:
        print("containerization of static html from {} failed".format(args.url))
        pass

if args.csvfile:
    target = pd.read_csv(args.csvfile, names=['col0', 'col1', 'col2'], encoding='ISO-8859-1')
    val = csvparsejs(target=target)
    print(str(val))
    csvparsestatic(target2=target)
    print("End")
elif args.url:
    singlesitejs()
    singlesitestatic()

else:
    print("Please provide website url or csv file")