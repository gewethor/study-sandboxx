# @Author: Matthew Hale <mlhale>
# @Date:   2018-02-14T23:02:38-06:00
# @Email:  mlhale@unomaha.edu
# @Filename: DockerFile
# @Last modified by:   mlhale
# @Last modified time: 2018-02-15T00:21:25-06:00
# @License: Funset is a web-based BIOI tool for visualizing genetic pathway information. This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
# @Copyright: Copyright (C) 2017 Matthew L. Hale, Dario Ghersi, Ishwor Thapa


# Pull base image.
FROM ubuntu:latest

ENV PYTHONUNBUFFERED 1

##### Linux stuff #####
RUN apt-get update --fix-missing

# We need wget to set up the PPA and xvfb to have a virtual screen and unzip to install the Chromedriver
RUN apt-get install -y wget xvfb unzip

# Set up the Chrome PPA
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list

# Update the package list and install chrome
RUN apt-get update -y
RUN apt-get install -y google-chrome-stable

# Set up Chromedriver Environment variables
ENV CHROMEDRIVER_VERSION 2.19
ENV CHROMEDRIVER_DIR /chromedriver
RUN mkdir $CHROMEDRIVER_DIR

# Download and install Chromedriver
RUN wget -q --continue -P $CHROMEDRIVER_DIR "http://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip"
RUN unzip $CHROMEDRIVER_DIR/chromedriver* -d $CHROMEDRIVER_DIR

# Put Chromedriver into the PATH
ENV PATH $CHROMEDRIVER_DIR:$PATH

RUN apt-get install python3 python3-pip -y
RUN pip3 install --upgrade pip
RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
RUN apt-get install -y nodejs

##### Python packages #####
RUN pip install HTMLArk
RUN pip install selenium
RUN pip install argparse
RUN pip install beautifulsoup4
RUN pip install urllib3
RUN pip install pandas

##### NPM stuff #####
RUN npm install request
RUN npm install node-fetch
RUN npm install sleep
RUN npm install pixelmatch
RUN npm install sharp

RUN git clone https://github.com/gewethor/study-sandboxx
