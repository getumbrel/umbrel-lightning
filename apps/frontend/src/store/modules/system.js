import API from "@/helpers/api";

// Initial state
const state = () => ({
  version: "",
  backupStatus: {
    status: "", //success, failed
    timestamp: null
  },
  backupOverTor: true, // by default we backup over Tor
  mostRecentBackupSuccess: false,
  onboarding: false, // assume false to prevent modal flickering
  loading: true,
  unit: "sats", //sats or btc
  api: {
    operational: false,
    version: ""
  },
  onionAddress: "",
  seedExists: false,
  localExplorerUrl: false,
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
  setBackupOverTor(state, backupOverTor) {
    state.backupOverTor = backupOverTor;
  },
  setMostRecentBackupSuccess(state, mostRecentBackupSuccess) {
    state.mostRecentBackupSuccess = mostRecentBackupSuccess;
  },
  setOnboarding(state, status) {
    state.onboarding = status;
  },
  setSeedExists(state, seedExists) {
    state.seedExists = seedExists;
  },
  setLocalExplorerUrl(state, localExplorerUrl) {
    state.localExplorerUrl = localExplorerUrl;
  }
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
  async getBackupOverTor({ commit }) {
    const backupOverTor = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/backup-over-tor`
    );
    commit("setBackupOverTor", backupOverTor);
  },
  async toggleBackupOverTor({ commit, state }) {
    const newValue = !state.backupOverTor;

    const response = await API.post(`${process.env.VUE_APP_API_BASE_URL}/v1/system/backup-over-tor`, {
      backupOverTor: newValue
    });

    if (response.data.success) {
      commit('setBackupOverTor', newValue);
    }
  },
  async getMostRecentBackupSuccess({ commit }) {
    const mostRecentBackupSuccess = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/recent-backup-success`
    );
    commit("setMostRecentBackupSuccess", mostRecentBackupSuccess);
  },
  async getOnboardingStatus({ commit }) {
    const onboarding = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/onboarding`
    );

    commit("setOnboarding", onboarding);
  },
  async onboardingComplete({ commit }) {
    commit("setOnboarding", false); // update state to immediately hide modal
    await API.post(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/onboarding`
    );
  },
  async getSeedExists({ commit }) {
    const seedExists = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/seed-exists`
    );
    commit("setSeedExists", seedExists);
  },
  async getLocalExplorerUrl({ commit }) {
    const {port, hiddenService} = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/explorer`
    );

    let localExplorerUrl = false;

    if (window.location.origin.endsWith(".onion") && hiddenService) {
      localExplorerUrl = `http://${hiddenService}`;
    } else if (port) {
      localExplorerUrl = `${window.location.protocol}//${window.location.hostname}:${port}`;
    }
    commit("setLocalExplorerUrl", localExplorerUrl);
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
