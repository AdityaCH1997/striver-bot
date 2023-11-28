const {Builder, By, Key, until} = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const cheerio = require('cheerio');
const ExcelJS = require('exceljs');
const { error } = require("selenium-webdriver");

function initOptions(o) {
    //   o.addArguments("headless");
    o.addArguments("disable-infobars");
    o.addArguments("no-sandbox");
    o.addArguments(
      "user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36 RuxitSynthetic/1.0 v6419931773 t38550 ath9b965f92 altpub"
    );
    o.addArguments("headless");
    o.setUserPreferences({
      credential_enable_service: false,
    });
}

const BasePage = function (customAudio = null) {
    let o = new chrome.Options();
    initOptions(o);
  
    this.driver = new Builder()
      .withCapabilities({ acceptSslCerts: true, acceptInsecureCerts: true })
      .setChromeOptions(o)
      .forBrowser("chrome")
      .build();
  
    this.visit = async function (theUrl) {
      return await this.driver.get(theUrl);
    };
  
    this.findById = async function (id) {
      await this.driver.wait(
        until.elementLocated(By.id(id)),
        10000,
        "Looking for element"
      );
      return await this.driver.findElement(By.id(id));
    };
  
    this.findByClassName = async function (name) {
      const els = await this.driver.wait(
        until.elementsLocated(By.className(name)),
        15000,
        "Looking for element"
      );
      return els[els.length - 1];
      return await this.driver.findElement(By.className(name));
    };
  
    this.scrollToBottom = async function () {
      this.driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
    };

    this.sleep = async function(timeInS) {
        await new Promise((resolve) => setTimeout(resolve, timeInS * 1000))
    };

    this.fetchCodingNinjasProblemSubject = async function () {
        let topic = "";
        try {
            await this.driver.wait(until.elementLocated(By.className('problem-title')), 1000);

            const testHeader = await this.driver.findElement(By.className('problem-title'));

            topic = await testHeader.getText();
        }
        catch(error) {
            console.log('Coding Ninjas Page Error: ',error);
        }
        return topic;
    }

    this.fetchLeetCodePageProblemSubject = async function () {
        let topic = "";
        let flag = false;

        try {
            await this.driver.wait(until.elementLocated(By.id('qd-content')), 1000);

            const testDiv = await this.driver.findElement(By.id('qd-content'));

            //await this.driver.wait(until.elementLocated(By.tagName('a')), 1000);

            const anchorTags = await testDiv.findElements(By.tagName('a'));

            //console.log('Anchor Tags found');

            for(const anchorTag of anchorTags) {
                const anchorText = await anchorTag.getText();
                if(flag) {
                    if(anchorText != 'Login / Sign up') {
                        topic = anchorText;
                    }                   
                    break;
                }
                if(anchorText=='Submissions') {
                    flag = true;
                }
                //console.log('Anchor Text: ', anchorText);
            }
            //topic = await anchorTag.getText();//await anchorTag.getAttribute('innerText');
            console.log('Topic: ', topic);
        }
        catch(error) {
            console.log('LeetCode page error: ', error);
        }

        return topic;
    }

    this.navigateToURLWithTimeout = async function(url, timeout) {

        try {
            await Promise.race([
                this.driver.get(url),
                new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error(`Timeout: Exceeded ${timeout} milliseconds`));
                    }, timeout);
                }),
            ]);
        } catch(error) {
            console.log('URL Fetch Error: ',error);
        }
        
    }

    this.fetchWorkbook = async function(filePath) {
      const workbook = new ExcelJS.Workbook();

      try {
        await workbook.xlsx.readFile(filePath);
        return workbook;
      }
      catch (error) {
        console.log('Error reading workbook: ',error.message);
        throw error;
      }
    }

    this.worksheetToArray = async function(worksheet) {
      const dataArray = [];

      worksheet.eachRow((row, rowNumber) => {
        const rowData = row.values;
        //dataArray.push({ rowNumber, rowData });
        dataArray.push(rowData);
      });

      return dataArray;
    }

    this.arrayToWorkbook = async function(array) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Converted WorkSheet');

      for(const rowData of array) {
        worksheet.addRow(rowData);
      }

      return workbook;
    }

    this.writeWorkbookToFile = async function(workbook, filePath) {
      await workbook.xlsx.writeFile(filePath);
    }

    //Fisher-Yates shuffle modern algorithm
    this.randomSort = async function(array) {
      if(Array.isArray(array)) {
        let temp = 0, pos = -1;
        for(let i = array.length-1; i>0; i--) {
          pos = Math.floor(Math.random() * (i+1));

          //Business Logic
          if(pos === 0) {
            pos = 1;
          }
          //Swap
          temp = array[pos];
          array[pos] = array[i];
          array[i] = temp;
        }
      }
      return array;
    }

  };
  
  module.exports = BasePage;