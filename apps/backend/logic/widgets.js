const numeral = require("numeral");

const lightning = require("logic/lightning.js");

async function getBitcoinWalletWidgetData() {
  const balance = await lightning.getWalletBalance();
  // lightning.getWalletBalance() returns the following format:
  // {
  //   "totalBalance": "216207",
  //   "confirmedBalance": "216207",
  //   "unconfirmedBalance": "0"
  // }

  const widgetData = {
    type: 'text-with-buttons',
    refresh: '5s',
    title: 'Bitcoin Wallet',
    text: numeral(balance.totalBalance).format('0,0'),
    subtext: 'sats',
    buttons: [
      {text: 'Withdraw', icon: 'arrow-up-right', link: '?action=send-bitcoin'},
      {text: 'Deposit', icon: 'arrow-down-right', link: '?action=receive-bitcoin'}
    ]
  };

  return widgetData;
}

async function getLightningWalletWidgetData() {
  const balance = await lightning.getChannelBalance();
  // lightning.getChannelBalance() returns the following format:
  // {
  //   "balance": "108177",
  //   "pendingOpenBalance": "0"
  // }

  const widgetData = {
    type: 'text-with-buttons',
    refresh: '2s',
    title: 'Lightning Wallet',
    text: numeral(balance.balance).format('0,0'),
    subtext: 'sats',
    buttons: [
      {text: 'Send', icon: 'arrow-up-right', link: '?action=send-lightning'},
      {text: 'Receive', icon: 'arrow-down-right', link: '?action=receive-lightning'}
    ]
  };

  return widgetData;
}

async function getLightningStatsWidgetData() {
  const lightningInfo = await lightning.getGeneralInfo();
  // lightning.getGeneralInfo() gives us peers and active channels
  // "lightningInfo": {
  //   ...
  //   "numActiveChannels": 2,
  //   "numPeers": 3,
  //   ...
  // }

  const rawChannels = await lightning.getChannels();

  let maxReceive = 0;
  let maxSend = 0;

  rawChannels.forEach(channel => {
    const localBalance = parseInt(channel.localBalance) || 0;
    const remoteBalance = parseInt(channel.remoteBalance) || 0;

    if (channel.type === "OPEN") {
      maxReceive += remoteBalance;
      maxSend += localBalance;
    }
  });

  const widgetData = {
    type: 'four-stats',
    refresh: '5s',
    link: '',
    items: [
      {title: 'Connections', text: lightningInfo.numPeers, subtext: 'peers'},
      {title: 'Active channels', text: lightningInfo.numActiveChannels, subtext: lightningInfo.numActiveChannels > 1 ? 'channels' : 'channel'},
      {title: 'Max send', text: formatSats(maxSend), subtext: 'sats'},
      {title: 'Max receive', text: formatSats(maxReceive), subtext: 'sats'}
    ]
  };

  return widgetData;
}

// Formats sats to an abbreviated format. e.g., 1200 => 1.2K or 1000000 => 1M
// We allow 1 decimal place for values between 1000 and 1000000, and no decimal places for values over 1000000 or under 1000.
const formatSats = (n) => {
  if (n < 1000) {
    return numeral(n).format('0a').toUpperCase();
  } else if (n < 1000000) {
    return numeral(n).format('0.0a').toUpperCase();
  } else {
    return numeral(n).format('0a').toUpperCase();
  }
};

module.exports = {
  getBitcoinWalletWidgetData,
  getLightningWalletWidgetData,
  getLightningStatsWidgetData
};
