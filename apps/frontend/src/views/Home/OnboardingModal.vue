<template>
  <b-modal
    id="onboarding-modal"
    :size="onboarding && (step === 0 || step === 1) ? 'lg' : 'md'"
    centered
    hide-footer
    hide-header
    no-close-on-esc
    no-close-on-backdrop
    v-model="this.displayModal"
  >
    <secret-words-display
      v-show="onboarding && step === 0"
      :nextStep="nextStep"
      :skipVerify="goToTerms"
    />
    <secret-words-verify
      v-show="onboarding && step === 1"
      :nextStep="nextStep"
      :prevStep="prevStep"
    />
    <terms v-if="onboarding && step === 2" :afterRequest="nextStep" />
    <bitcoin-sync-modal v-if="!onboarding || step === 3" />
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

import SecretWordsDisplay from "./SecretWordsDisplay.vue";
import SecretWordsVerify from "./SecretWordsVerify.vue";
import Terms from "./Terms.vue";
import BitcoinSyncModal from "./BitcoinSyncModal";

export default {
  data() {
    return {
      step: 0,
    };
  },
  computed: {
    ...mapState({
      displayModal: state => state.system.onboarding || state.bitcoin.initialblockdownload,
      onboarding: state => state.system.onboarding,
      initialblockdownload: state => state.bitcoin.initialblockdownload
    })
  },
  methods: {
    nextStep() {
      // this prevents flickering the "bitcoin still syncing" view
      // if ibd is done and user has acknowledged terms
      if (this.step === 2 && !this.initialblockdownload) {
        return this.finish();
      }
      this.step++;
    },
    prevStep() {
      this.step = this.step - 1;
    },
    goToTerms() {
      this.step = 2;
    },
    finish() {
      this.$bvModal.hide("onboarding-modal");
      // this resets the modal to show words without flickering on modal disappear
      setTimeout(() => (this.step = 0), 1000);
    }
  },
  async created() {
    // only call getSeed when displaying secret modal
    this.$root.$on("bv::modal::shown", async (bvEvent, modalId) => {
      if (modalId === "onboarding-modal") {
        await this.$store.dispatch("user/getSeed");
      }
    });
    // clear the seed from state after viewing
    this.$root.$on("bv::modal::hidden", async (bvEvent, modalId) => {
      if (modalId === "onboarding-modal") {
        this.$store.dispatch("user/clearSeed");
      }
    });
  },
  components: {
    Terms,
    BitcoinSyncModal,
    SecretWordsDisplay,
    SecretWordsVerify
  }
};
</script>
