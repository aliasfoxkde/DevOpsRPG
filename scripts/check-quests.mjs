import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/quests', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Extract quest data from the page
  const questAnalysis = await page.evaluate(() => {
    // Find all quest cards
    const cards = document.querySelectorAll('[class*="bg-slate"]');
    const quests = [];

    cards.forEach(card => {
      const text = card.innerText;
      if (text.includes('⭐') || text.includes('difficulty') || text.includes('XP')) {
        quests.push(text.substring(0, 150));
      }
    });

    return {
      questCardCount: quests.length,
      samples: quests.slice(0, 10)
    };
  });

  console.log('=== QUEST ANALYSIS ===');
  console.log('Quest cards found:', questAnalysis.questCardCount);
  console.log('\nSample quest cards:');
  questAnalysis.samples.forEach((s, i) => {
    console.log(`${i + 1}. ${s.replace(/\n/g, ' | ')}`);
  });

  // Check the quests data directly
  const questsData = await page.evaluate(() => {
    // @ts-ignore
    if (window.__QuestJournalPage__) {
      // @ts-ignore
      return window.__QuestJournalPage__;
    }
    return null;
  });

  await browser.close();
})();
