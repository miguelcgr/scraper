const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeProduct(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const articles = await page.evaluate(() => {
    // Get all rows in the table
    const rows = Array.from(document.querySelectorAll("tr"));

    const articles = [];
    let currentArticle = null;

    // Loop through the first 30 rows in the table
    rows.slice(30).map((row) => {
      // Rows that are titles have the class "athing"
      if (row.classList.contains("athing")) {
        const titleLine = row.querySelector("span.titleline");

        const rankLine = row.querySelector("span.rank");
        const title = titleLine ? titleLine.innerText : null;
        const rank = rankLine ? rankLine.innerText : null;

        // push current artile to the results array
        if (currentArticle) {
          articles.push(currentArticle);
        }

        // new article object with the title
        currentArticle = { rank, title, score: null, comments: null };
      } else if (currentArticle) {
        const scoreLine = row.querySelector("span.score");
        const score = scoreLine ? scoreLine.innerText : null;

        // Check if the row is a comments row
        const commentsElement = Array.from(row.querySelectorAll("a")).find(
          (a) => a.innerText.includes("comment")
        );

        const comments = commentsElement ? commentsElement.innerText : null;

        // Add comments and score to the  article
        currentArticle.comments = comments;
        currentArticle.score = score;

        // Push the completed object to the results array
        articles.push(currentArticle);

        // Reset the currentArticle
        currentArticle = null;
      }
    });

    if (currentArticle) {
      articles.push(currentArticle);
    }

    return articles;
  });

  // Filter articles based on the number of words in the title, sort by comments and score respectively. We use regex to exclude special characters
  const longTitleArticles = articles
    .filter(
      (article) =>
        article.title
          .replace(/[^\w\s]/g, "")
          .trim()
          .split(/\s+/).length > 5
    )
    .sort((a, b) => parseInt(b.comments) - parseInt(a.comments));

  const shortTitleArticles = articles
    .filter(
      (article) =>
        article.title
          .replace(/[^\w\s]/g, "")
          .trim()
          .split(/\s+/).length <= 5
    )
    .sort((a, b) => parseInt(b.score) - parseInt(a.score));

  const usageData = [
    {
      timeStamp: new Date().toISOString(),
      articlesCount: longTitleArticles.length,
      filterUsed: "longTitleArticles",
    },
    {
      timeStamp: new Date().toISOString(),
      articlesCount: shortTitleArticles.length,
      filterUsed: "shortTitleArticles",
    },
  ];

  // Store the usage data in a json file
  fs.writeFileSync("usageData.json", JSON.stringify(usageData, null, 2));
  // Store the arrays into two json files
  fs.writeFileSync(
    "longTitleArticles.json",
    JSON.stringify(longTitleArticles, null, 2)
  );
  fs.writeFileSync(
    "shortTitleArticles.json",
    JSON.stringify(shortTitleArticles, null, 2)
  );
  console.log(
    '* * * The data has been saved to "longTitleArticles.json", "shortTitleArticles.json" and "usageData.json" * * *'
  );
  await browser.close();
}

scrapeProduct("https://news.ycombinator.com/");
