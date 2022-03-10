import API from "@/helpers/api";

// Initial state
const state = () => ({
  seed: []
});

// Functions to update the state directly
const mutations = {
  setSeed(state, seed) {
    state.seed = seed;
  }
};

// Functions to get data from the API
const actions = {
  async getSeed({ commit, state }, { password, otpToken }) {
    let rawSeed;

    //get user's stored seed if already registered
    if (state.registered && password) {
      rawSeed = await API.post(
        `${process.env.VUE_APP_MANAGER_API_URL}/v1/account/seed`,
        {
          password,
          otpToken
        },
        false
      );
      if (rawSeed.data) {
        rawSeed = rawSeed.data;
      }
    } else {
      //get a new seed if new user
      rawSeed = await API.get(
        `${process.env.VUE_APP_BACKEND_URL}/v1/lnd/wallet/seed`
      );
    }

    if (rawSeed && rawSeed.seed) {
      commit("setSeed", rawSeed.seed);
    }
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
