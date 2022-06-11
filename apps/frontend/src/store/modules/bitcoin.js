import API from "@/helpers/api";
import { toPrecision } from "@/helpers/units";

// Initial state
const state = () => ({
  operational: false,
  calibrating: false,
  version: "",
  ipAddress: "",
  onionAddress: "",
  currentBlock: 0,
  chain: "",
  percent: -1, //for loading state
  initialblockdownload: false,
  depositAddress: "",
  stats: {
    peers: -1,
    mempool: -1,
    hashrate: -1,
    blockchainSize: -1,
  },
  peers: {
    total: 0,
    inbound: 0,
    outbound: 0,
  },
  balance: {
    total: -1, //loading
    confirmed: -1,
    pending: -1,
    pendingIn: -1,
    pendingOut: -1,
  },
  transactions: [
    { type: "loading" },
    { type: "loading" },
    { type: "loading" },
    { type: "loading" },
  ],
  pending: [],
  price: 0,
  fees: {
    fast: {
      total: "--",
      perByte: "--",
      error: {
        code: "",
        text: "",
      },
    },
    normal: {
      total: "--",
      perByte: "--",
      error: {
        code: "",
        text: "",
      },
    },
    slow: {
      total: "--",
      perByte: "--",
      error: {
        code: "",
        text: "",
      },
    },
    cheapest: {
      total: "--",
      perByte: "--",
      error: {
        code: "",
        text: "",
      },
    },
  },
});

// Functions to update the state directly
const mutations = {
  peers(state, peers) {
    state.peers.total = peers.total || 0;
    state.peers.inbound = peers.inbound || 0;
    state.peers.outbound = peers.outbound || 0;
  },

  balance(state, balance) {
    state.balance.total = parseInt(balance.totalBalance);
    state.balance.confirmed = parseInt(balance.confirmedBalance);
    state.balance.pending = parseInt(balance.unconfirmedBalance);
  },

  transactions(state, transactions) {
    // Clear previously loaded data
    // state.transactions = [];
    // state.pending = [];

    // Loop through transactions and sort them by type
    // transactions.forEach((transaction) => {
    //     // Only display Bitcoin transactions
    //     if (transaction.type === 'ON_CHAIN_TRANSACTION_SENT' || transaction.type === 'ON_CHAIN_TRANSACTION_RECEIVED') {
    //         if (transaction.numConfirmations > 0) {
    //             state.transactions.push(transaction);
    //         } else {
    //             state.pending.push(transaction);
    //         }
    //     }
    // });
    // console.log(transactions);

    state.transactions = transactions;
  },

  setSyncedToChain(state, syncedToChain) {
    state.syncedToChain = syncedToChain;
  },

  setSync(state, sync) {
    state.percent = Number(toPrecision(parseFloat(sync.percent) * 100, 2));
    state.blockHeight = sync.knownBlockCount;
    state.currentBlock = sync.processedBlocks;
    state.initialblockdownload = sync.initialblockdownload;
  },

  depositAddress(state, address) {
    state.depositAddress = address;
  },

  fees(state, fees) {
    for (const [speed, estimate] of Object.entries(fees)) {
      // If the API returned an error message
      if (estimate.code) {
        state.fees[speed].total = 0;
        state.fees[speed].perByte = "N/A";
        state.fees[speed].error = {
          code: estimate.code,
          text: estimate.text,
        };
      } else {
        state.fees[speed].total = estimate.feeSat;
        state.fees[speed].perByte = estimate.feerateSatPerByte;
        state.fees[speed].sweepAmount = estimate.sweepAmount;
        state.fees[speed].error = false;
      }
    }
  },

  price(state, usd) {
    state.price = usd;
  },
};

// Functions to get data from the API
const actions = {
  async getBalance({ commit }) {
    const balance = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/wallet/btc`
    );

    if (balance) {
      commit("balance", balance);
    }
  },

  async getSync({ commit }) {
    const sync = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/bitcoin/sync`
    );

    if (sync) {
      commit("setSync", sync);
    }
  },

  async getTransactions({ commit }) {
    const transactions = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/transaction`
    );
    commit("transactions", transactions);
  },

  async getPrice({ commit }) {
    const price = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/external/price`
    );

    if (price) {
      commit("price", price.USD);
    }
  },

  async getDepositAddress({ commit }) {
    const { address } = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/address`
    );

    if (address) {
      commit("depositAddress", address);
    }
  },

  async getFees({ commit }, { address, confTarget, amt, sweep }) {
    const fees = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/transaction/estimateFee?address=${address}&confTarget=${confTarget}&amt=${amt}&sweep=${sweep}`
    );

    if (fees) {
      commit("fees", fees);
    }
  },
};

const getters = {
  status(state) {
    const data = {
      class: "loading",
      text: "Loading...",
    };

    if (state.operational) {
      data.class = "active";
      data.text = "Operational";
    }

    return data;
  },
  transactions(state) {
    const txs = [];

    //return default "loading" transactions until txs aren't fetched
    if (
      state.transactions &&
      state.transactions.length &&
      state.transactions[0]["type"] === "loading"
    ) {
      return state.transactions;
    }

    if (state.transactions) {
      state.transactions.forEach((tx) => {
        const amount = Number(tx.amount);

        let type = "incoming";
        if (amount < 0) {
          type = "outgoing";
        } else if (amount === 0) {
          //skip self incoming txs of change
          return;
        }

        // if (tx.numConfirmations === 0) {

        // }
        // type = "pending";

        let description = "Unknown";

        if (tx.type === "CHANNEL_OPEN" || tx.type === "PENDING_OPEN") {
          description = "Lightning Wallet";
        } else if (tx.type === "CHANNEL_CLOSE" || tx.type === "PENDING_CLOSE") {
          description = "Lightning Wallet";
        } else if (tx.type === "ON_CHAIN_TRANSACTION_SENT") {
          description = "Withdrawal";
        } else if (tx.type === "ON_CHAIN_TRANSACTION_RECEIVED") {
          description = "Deposit";
        }

        txs.push({
          type,
          amount: amount < 0 ? amount * -1 : amount, //for formatting +/- in view
          timestamp: new Date(Number(tx.timeStamp) * 1000),
          description,
          hash: tx.txHash,
          confirmations: tx.numConfirmations,
        });
      });

      // Sort txs by date
      txs.sort(function(tx1, tx2) {
        return tx2.timestamp - tx1.timestamp;
      });
    }

    return txs;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
