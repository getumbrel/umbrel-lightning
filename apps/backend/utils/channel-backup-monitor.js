const crypto = require('crypto');

const constants = require("utils/const.js");
const backups = require("utils/backups.js");
const diskLogic = require("logic/disk");

const ONE_SECOND_IN_MS = 1000;
const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * 60;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const log = message => console.log(`[backup-monitor] ${message}`);

module.exports = async () => {
  log('Starting...')
  while (true) {
    try {
      const jsonStore = await diskLogic.getJsonStore();
      if (!jsonStore.automaticBackups) {
        log('Automatic backups disabled.');
        log('Sleeping...');
        await delay(ONE_MINUTE_IN_MS);
        continue;
      }

      log('Checking channel backup...');
      const channelBackup = await diskLogic.readBackupFile();
      const checksum = crypto.createHash('sha256').update(channelBackup).digest('hex');
      const {previousBackupChecksum} = jsonStore;
      const backupHasChanged = checksum !== previousBackupChecksum;

      // Random number between 0-65535, running once a minute, should trigger
      // a decoy backup once every ~45 days
      const doDecoyBackup = crypto.randomBytes(2).readUIntBE(0, 2) === 0;

      if (backupHasChanged || doDecoyBackup) {
        if (backupHasChanged) log('Channel backup has changed, backing up!');
        if (doDecoyBackup && !backupHasChanged) log('Doing decoy backup!');
        const seed = jsonStore.seed.join(' ');
        await backups.uploadBackup(seed, channelBackup);
        await diskLogic.updateJsonStore({
          previousBackupChecksum: checksum,
          previousBackupTime: Date.now(),
          mostRecentBackupSuccess: true,
        });
        log('Backup complete!');
      }
    } catch (e) {
      log(`Error: ${e.message}`);
      const { onboarding } = await diskLogic.getJsonStore();
      if (!onboarding) {
        await diskLogic.updateJsonStore({
          mostRecentBackupSuccess: false,
        });
      }
    }
    log('Sleeping...');
    await delay(ONE_MINUTE_IN_MS);
  }
};
