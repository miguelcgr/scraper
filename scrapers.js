const puppeteer = require("puppeteer");

async function scrapeProduct(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const allArticles = await page.evaluate(() => {
    const articles = document.querySelectorAll("tr.athing");
    return Array.from(articles)
      .slice(0, 4)
      .map((article) => {
        const rank = article.querySelector(".rank").innerText;
        const title = article.querySelector(".title").innerText;
        const titleline = article.querySelector(".titleline").innerText;
        const score = article.querySelector(".score").innerText;
        // number of comments ?
        return { rank, title, titleline };
      });

    const subLines = document.querySelectorAll("td.subtext");
  });

  console.log("allArticles :>> ", allArticles);
  browser.close();
}
//number
// title
// points
// comments
