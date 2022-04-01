<template>
  <b-modal
    id="secret-words-modal"
    size="xl"
    centered
    hide-footer
    hide-header
    no-close-on-esc
    no-close-on-backdrop
  >
    <template v-if="step === 0">
      <div class="py-4 px-3">
        <div
          class="d-flex align-items-center w-100 flex flex-column text-center"
        >
          <h2 class="lowercase">note down your secret words</h2>
          <p class="mb-4" style="width: 85%;">
            Keep these words at a secure place. You’ll need these to recover
            your funds if something goes wrong with your node.
          </p>
          <div class="px-0 sm:px-2">
            <seed :words="seed" v-if="seed.length"></seed>
          </div>
        </div>
        <div
          class="d-flex flex-column justify-content-center align-items-center"
        >
          <div class="mb-3">
            <a href="#" class="text-center" @click="goToTerms">
              NOTE DOWN LATER
            </a>
          </div>
          <div>
            <b-button variant="success px-3" @click="nextStep">Next</b-button>
          </div>
        </div>
      </div>
    </template>
    <template v-if="step === 1">
      <div class="py-4 px-3">
        <div
          class="d-flex align-items-center w-100 flex flex-column text-center"
        >
          <h2 class="lowercase">enter your secret words</h2>
          <p class="mb-4 w-75">
            Enter your secret words in the exact order to verify you’ve
            correctly noted them down.
          </p>
          <seed-verify
            :words="seed"
            :nextStep="nextStep"
            :prevStep="prevStep"
          ></seed-verify>
        </div>
      </div>
    </template>
    <template v-if="step === 2">
      <terms-modal :afterRequest="finish"></terms-modal>
    </template>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

import Seed from "@/components/Utility/Seed";
import SeedVerify from "@/components/Utility/SeedVerify";
import TermsModal from "./TermsModal.vue";

export default {
  data() {
    return {
      step: 0
    };
  },
  methods: {
    nextStep() {
      console.log("hit, ");
      this.step = this.step + 1;
    },
    prevStep() {
      this.step = this.step - 1;
    },
    goToTerms() {
      this.step = 2;
    },
    finish() {
      this.$bvModal.hide("secret-words-modal");
      // this resets the modal to show words without flickering on modal disappear
      setTimeout(() => (this.step = 0), 1000);
    }
  },
  computed: {
    ...mapState({
      seed: state => state.user.seed
    })
  },
  components: {
    Seed,
    SeedVerify,
    TermsModal
  }
};
</script>
