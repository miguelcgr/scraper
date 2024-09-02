const puppeteer = require("puppeteer");

async function scrapeProduct(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const articles = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr"));

    const articles = [];
    let currentArticle = null;

    rows.map((row) => {
      if (row.classList.contains("athing")) {
        const titleLine = row.querySelector("span.titleline");

        const rankLine = row.querySelector("span.rank");
        const title = titleLine ? titleLine.innerText : null;
        const rank = rankLine ? rankLine.innerText : null;

        if (currentArticle) {
          articles.push(currentArticle);
        }

        // new article object
        currentArticle = { rank, title, score: null, comments: null };
      } else if (currentArticle) {
        const scoreLine = row.querySelector("span.score");
        const score = scoreLine ? scoreLine.innerText : null;

        const commentsElement = Array.from(row.querySelectorAll("a")).find(
          (a) => a.innerText.includes("comment")
        );

        const comments = commentsElement ? commentsElement.innerText : null;

        currentArticle.comments = comments;
        currentArticle.score = score;

        articles.push(currentArticle);

        currentArticle = null;
      }
    });
    if (currentArticle) {
      articles.push(currentArticle);
    }

    return articles;
  });

  console.log("articles :>> ", articles);

  await browser.close();
}

scrapeProduct("https://news.ycombinator.com/");
