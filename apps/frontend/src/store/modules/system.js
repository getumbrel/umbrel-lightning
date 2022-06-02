import API from "@/helpers/api";

// Initial state
const state = () => ({
  version: "",
  backupStatus: {
    status: "", //success, failed
    timestamp: null
  },
  acknowledged: true, // assume true to prevent modal flickering
  loading: true,
  unit: "sats", //sats or btc
  api: {
    operational: false,
    version: ""
  },
  onionAddress: "",
  seedExists: false
});

// Functions to update the state directly
const mutations = {
  setVersion(state, version) {
    state.version = version;
  },
  setUnit(state, unit) {
    state.unit = unit;
  },
  setApi(state, api) {
    state.api = api;
  },
  setLoading(state, loading) {
    state.loading = loading;
  },
  setOnionAddress(state, address) {
    state.onionAddress = address;
  },
  setBackupStatus(state, status) {
    state.backupStatus = status;
  },
  setTermsAcknowledgeStatus(state, status) {
    state.acknowledged = status;
  },
  setSeedExists(state, seedExists) {
    state.seedExists = seedExists;
  },
};

// Functions to get data from the API
const actions = {
  async getVersion({ commit }) {
    const data = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/info`
    );
    if (data && data.version) {
      let { version } = data;
      if (data.build) {
        version += `-build-${data.build}`;
      }
      commit("setVersion", version);
    }
  },
  async getUnit({ commit }) {
    if (window.localStorage && window.localStorage.getItem("unit")) {
      commit("setUnit", window.localStorage.getItem("unit"));
    }
  },
  changeUnit({ commit }, unit) {
    if (unit === "sats" || unit === "btc") {
      window.localStorage.setItem("unit", unit);
      commit("setUnit", unit);
    }
  },
  async getApi({ commit }) {
    const api = await API.get(`${process.env.VUE_APP_API_BASE_URL}/ping`);
    commit("setApi", {
      operational: !!(api && api.version),
      version: api && api.version ? api.version : ""
    });
  },
  async getBackupStatus({ commit }) {
    const status = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/backup-status`
    );
    if (status && status.timestamp) {
      commit("setBackupStatus", status);
    }
  },
  async getTermsAcknowledgeStatus({ commit }) {
    const acknowledged = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/terms-acknowledge`
    );

    commit("setTermsAcknowledgeStatus", acknowledged);
  },
  async setTermsAcknowledgeStatus({ commit }) {
    commit("setTermsAcknowledgeStatus", true); // update state to immediately hide modal
    await API.post(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/terms-acknowledge`
    );
  },
  async getSeedExists({ commit }) {
    const seedExists = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/seed-exists`
    );
    commit("setSeedExists", seedExists);
  },
};

const getters = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
