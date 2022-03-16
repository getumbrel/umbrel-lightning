import API from "@/helpers/api";

// Initial state
const state = () => ({
  version: "",
  backupStatus: {
    status: "", //success, failed
    timestamp: null,
  },
  loading: true,
  unit: "sats", //sats or btc
  api: {
    operational: false,
    version: "",
  },
  onionAddress: "",
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
};

// Functions to get data from the API
const actions = {
  async getVersion({ commit }) {
    const data = await API.get(
      `${process.env.VUE_APP_BACKEND_URL}/v1/system/info`
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
    const api = await API.get(`${process.env.VUE_APP_BACKEND_URL}/ping`);
    commit("setApi", {
      operational: !!(api && api.version),
      version: api && api.version ? api.version : "",
    });
  },
  async getBackupStatus({ commit }) {
    const status = await API.get(
      `${process.env.VUE_APP_BACKEND_URL}/v1/system/backup-status`
    );
    if (status && status.timestamp) {
      commit("setBackupStatus", status);
    }
  },
};

const getters = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
