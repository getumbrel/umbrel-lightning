import Vue from "vue";
import Vuex from "vuex";

//Modules
import user from "./modules/user";
import system from "./modules/system";
import bitcoin from "./modules/bitcoin";
import lightning from "./modules/lightning";

Vue.use(Vuex);

// Initial State
const state = {};

// Getters
const getters = {};

// Mutations
const mutations = {};

// Actions
const actions = {};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  modules: {
    user,
    system,
    bitcoin,
    lightning
  }
});
