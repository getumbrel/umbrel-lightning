import API from "@/helpers/api";

const emptySeedArray = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""] // for loading placeholder

// Initial state
const state = () => ({
  seed: emptySeedArray,
});

// Functions to update the state directly
const mutations = {
  setSeed(state, seed) {
    state.seed = seed;
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
