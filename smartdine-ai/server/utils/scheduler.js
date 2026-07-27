const cron = require('node-cron');
const { computeDailyRollup } = require('./analyticsJob');

/**
 * Runs the WaitingTimeAnalytics rollup once a day at 00:05 server time,
 * summarizing the day that just ended. Called once from server.js at boot.
 */
function startScheduledJobs() {
  cron.schedule('5 0 * * *', async () => {
    try {
      const doc = await computeDailyRollup();
      console.log(`[analyticsJob] Rolled up waiting-time analytics for ${doc.date.toDateString()}`);
    } catch (err) {
      console.error('[analyticsJob] Daily rollup failed:', err.message);
    }
  });
}

module.exports = { startScheduledJobs };
