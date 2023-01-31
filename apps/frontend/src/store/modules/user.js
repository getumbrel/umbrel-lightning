import API from "@/helpers/api";

const emptySeedArray = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""] // for loading placeholder

// Initial state
const state = () => ({
  seed: emptySeedArray,
  lndConfig: {}
});

// Functions to update the state directly
const mutations = {
  setSeed(state, seed) {
    state.seed = seed;
  },
  setLndConfig(state, lndConfig) {
    state.lndConfig = lndConfig;
  }
};

// Functions to get data from the API
const actions = {
  async getSeed({ commit }) {
    //get user's stored seed if already registered
    const rawSeed = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/system/seed`
    );

    if (rawSeed && rawSeed.seed) {
      commit("setSeed", rawSeed.seed);
    }
  },
  async clearSeed({ commit }) {
    commit("setSeed", emptySeedArray);
  },
  async getLndConfig({ commit }) {
    const existingLndConfig = await API.get(
      `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/conf/lnd-config`
    );
    if (existingLndConfig) {
      commit("setLndConfig", existingLndConfig);
    }
  },
  async updateLndConfig({ commit }, lndConfig) {
    commit("setLndConfig", lndConfig);
  }
};

const getters = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
