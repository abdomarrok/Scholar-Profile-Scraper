# Scholar Profile Scraper

scrap msila profs info from google scholar 
This is a Node.js script that uses the cheerio and axios modules to scrape scholar profiles from Google Scholar.

## How to use
Install Node.js if not already installed.
Open the file in a text editor.
Set the searchString variable to the name you want to search for.
Set the pagesLimit variable to the number of pages you want to scrape.
Run the script using node scriptname.js in your command prompt.
## What it does
The script searches for scholar profiles by name on Google Scholar, scrapes the data for each profile, and outputs it in the console as an array of objects. The objects contain information such as the scholar's name, email, affiliations, and interests. The script also outputs a link to the next page of results if there are more pages to scrape.
