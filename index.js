const {Builder, By, Key, until} = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const cheerio = require('cheerio');
const ExcelJS = require('exceljs');
const { error } = require("selenium-webdriver");
const BasePage = require("./webpage");

async function initiateChromeWebDriverSession2() {
    let driver = await new Builder().forBrowser("chrome").build();

    let url = "https://takeuforward.org/";
    await driver.get(url);

    await driver.findElement(By.linkText("Striver’s DSA Sheets")).sendKeys("", Key.RETURN);

    setInterval(function() {
        driver.close();
    }, 10000);
}

async function initiateChromeWebDriverSession() {
    let driver = await new Builder().forBrowser("chrome").build();

    let url = "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/";
    await driver.get(url);

    await driver.findElement(By.name("s")).sendKeys("Helloe Striver!", Key.RETURN);

    setInterval(function() {
        driver.close();
    }, 10000);
}

//JavaScript Enum implementation
const StriverDSASheets = {
    A2ZDSASheet: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
    LastMoment79Sheet: "https://takeuforward.org/interview-sheets/strivers-79-last-moment-dsa-sheet-ace-interviews/",
    TopInterviewSheet: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/",
};

async function startBot() {
    
	const page = new BasePage();
	let site = "https://takeuforward.org/";
    console.log('Welcome to the website takeuforward by Striver');

    let dynamicTitle1 = '';
    let dynamicTitle2 = 'Leetcode link';

    await page.visit(site);      
    await page.sleep(1);

    //Change the Sheet Link below
	site = StriverDSASheets.A2ZDSASheet;

    if(site == StriverDSASheets.A2ZDSASheet) {
        dynamicTitle1 = 'CS link';
    }
    else {
        dynamicTitle1 = 'CodeStudio link';
    }
    
	await page.visit(site);
    await page.sleep(1);

    try {
            await fetchTestLinks(page, dynamicTitle1, dynamicTitle2);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await page.sleep(2);
        
    } catch(e) {
        console.error(e)
    }
        
}

async function fetchTestLinks(page, dynamicTitle1, dynamicTitle2) {
    try {

        const dynamicPath1 = `.//td[@title="${dynamicTitle1}"]`;
        const dynamicPath2 = `.//td[@title="${dynamicTitle2}"]`;
 
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('LeetCode and CodeStudio Links');

        let slNo = 1;

        //Wait for the page to load
        await page.driver.wait(until.elementLocated(By.tagName('table')), 3000);

        const tables = await page.driver.findElements(By.tagName('table'));

        worksheet.columns = [
            { header: 'Sl.No.', key: 'Sl.No.', width: 10},
            { header: 'LeetCode Link', key: 'Link', width: 30},
            { header: 'LC Topic', key: 'topic', width: 50},
            { header: 'Coding Ninjas Link', key: 'Link2', width: 30},
            { header: 'CN Topic', key: 'topic2', width: 50},
        ];
        //worksheet.addRow({ '"Sl. No."': 'Sl. No.', '"Links"': 'Links' });
        //worksheet.addRow({ 'Sl.No.': 1, 'Link': 'https://leetcode.com' });
        let count = 0;
        for(const table of tables) {
            const tdElements2 = await table.findElements(By.xpath(dynamicPath1));
            const tdElements = await table.findElements(By.xpath(dynamicPath2));

            if(tdElements.length === tdElements2.length) {
                for(let i=0; i< tdElements.length; i++) {
                    let td = tdElements2[i];
                    let td2 = tdElements[i];

                    const innerHTML = await td.getAttribute('innerHTML');
                    const innerHTML2 = await td2.getAttribute('innerHTML');

                    const $ = cheerio.load(innerHTML);
                    const $2 = cheerio.load(innerHTML2);

                    const anchorTag = $('a');
                    const anchorTag2 = $2('a');

                    if(anchorTag.length > 0 || anchorTag2.length > 0) {
                        const href = anchorTag.attr('href');
                        const href2 = anchorTag2.attr('href');

                        if(href2 != null) {

                            let problemStatement = "";
                            let problemStatement2 = "";
                            
                            try {
                                await page.driver.executeScript("window.open('','_blank');");
                                let windowHandles = await page.driver.getAllWindowHandles();
                                
                                await page.driver.switchTo().window(windowHandles[1]);

                                await page.sleep(2);

                                // await page.driver.get(href2);
                                // await page.driver.manage().setTimeouts({ implicit: 2000 });

                                await page.navigateToURLWithTimeout(href2, 3000);

                                //await page.sleep(2);

                                problemStatement = await page.fetchLeetCodePageProblemSubject();

                                console.log('LeetCode Problem Statement: ', problemStatement);

                                await page.driver.close();

                                await page.driver.switchTo().window(windowHandles[0]);
                                
                                await page.sleep(1);
                            }
                            catch(error) {
                                console.log('Error: ',error);
                            }

                            if(href != null) {
                                try {
                                    await page.driver.executeScript("window.open('','_blank');");
                                    windowHandles = await page.driver.getAllWindowHandles();
                                    
                                    await page.driver.switchTo().window(windowHandles[1]);

                                    await page.sleep(1);

                                    await page.navigateToURLWithTimeout(href, 2000);

                                    problemStatement2 = await page.fetchCodingNinjasProblemSubject();

                                    console.log('Coding Ninjas Statement: ', problemStatement2);

                                    await page.driver.close();

                                    await page.driver.switchTo().window(windowHandles[0]);
                                    
                                    await page.sleep(1);
                                }
                                catch(error) {
                                    console.log('Error: ',error);
                                }

                                worksheet.addRow({'Sl.No.': slNo++, 'Link': href2, 'topic': problemStatement, 'Link2': href, 'topic2': problemStatement2});
                            }
                            else {
                                worksheet.addRow({'Sl.No.': slNo++, 'Link': href2, 'topic': problemStatement});
                            }                         
                            //count++;
                        }
                        else if(href != null) {
                            try {
                                await page.driver.executeScript("window.open('','_blank');");
                                const windowHandles = await page.driver.getAllWindowHandles();
                                
                                await page.driver.switchTo().window(windowHandles[1]);

                                await page.sleep(1);

                                await page.navigateToURLWithTimeout(href, 2000);

                                const problemStatement = await page.fetchCodingNinjasProblemSubject();

                                console.log('Coding Ninjas Statement: ', problemStatement);

                                worksheet.addRow({'Sl.No.': slNo++, 'Link2': href, 'topic2': problemStatement});

                                await page.driver.close();

                                await page.driver.switchTo().window(windowHandles[0]);
                                
                                await page.sleep(1);
                            }
                            catch {
                                console.log('Error: ',error);
                            }
                            //count++;
                        }
                        else {
                            console.log('No Link clicked');
                        }
                    }
                    else {
                        console.log('No anchor tag found ');
                    }
                    /*if(count >= 5) {
                        break;
                    }*/
                }
            }
            else {
                for(const td of tdElements) {
                    const innerHTML = await td.getAttribute('innerHTML');

                    //Parse the innerHTML using Cheerio
                    const $ = cheerio.load(innerHTML);

                    //Find the anchor <a> tag
                    const anchorTag = $('a');


                    if(anchorTag.length > 0) {
                        const href = anchorTag.attr('href');
                        
                        if(href) {
                            console.log(href);
                            //await page.driver.get(href);
                            const newTab = await page.driver.executeScript("window.open('','_blank');");
                            const windowHandles = await page.driver.getAllWindowHandles();
                            
                            await page.driver.switchTo().window(windowHandles[1]);

                            await page.sleep(1);

                            await page.driver.get(href);

                            await page.sleep(2);

                            const problemStatement = await page.fetchLeetCodePageProblemSubject();

                            console.log('Statement: ', problemStatement);

                            worksheet.addRow({'Sl.No.': slNo++, 'Link': href, 'topic': problemStatement});

                            await page.driver.close();

                            await page.driver.switchTo().window(windowHandles[0]);
                            
                            await page.sleep(1);
                            console.log('Clicked on LeetCode Link');
                            //count++;
                            //console.log('WorkSheet Row: ', worksheet.getRow());
                        }
                        else {
                            console.log('No LeetCode Link clicked');
                        }
                    }
                    else {
                        console.log('No anchor tag found ');
                    }

                    /*if(count >= 50) {
                        break;
                    }*/
                }
            }
        }

        //Check Sheet Values
        //console.log('WorkSheet Data: ', worksheet.getSheetValues());

        console.log('Writing to Excel Sheet');
        //Save Excel File
        await workbook.xlsx.writeFile('LeetCode_Practice_List_8.xlsx');

        console.log('Saved Excel Sheet');
    } catch(error) {
        console.error('Error: ', error);
    } finally {
        page.driver.close();
    }
};

(async () => {
	await startBot()
})()