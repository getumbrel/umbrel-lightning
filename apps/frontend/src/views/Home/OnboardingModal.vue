<template>
  <b-modal
    id="initial-setup-modal"
    size="lg"
    centered
    hide-footer
    hide-header
    no-close-on-esc
    no-close-on-backdrop
    v-model="this.displayModal"
  >
    <secret-words-display
      v-if="step === 0"
      :nextStep="nextStep"
      :skipVerify="goToTerms"
    />
    <secret-words-verify
      v-if="step === 1"
      :nextStep="nextStep"
      :prevStep="prevStep"
    />
    <terms v-if="step === 2" :afterRequest="nextStep" />
    <bitcoin-syncing-modal v-if="step === 3" />
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

import SecretWordsDisplay from "./SecretWordsDisplay.vue";
import SecretWordsVerify from "./SecretWordsVerify.vue";
import Terms from "./Terms.vue";
import BitcoinStillSyncingModal from "./BitcoinStillSyncingModal";

export default {
  data() {
    return {
      step: 0
    };
  },
  methods: {
    nextStep() {
      // this prevents flickering the "bitcoin still syncing" view
      // if ibd is done and user has acknowledged terms
      if (this.initialblockdownload) {
        this.step = this.step + 1;
      } else {
        this.finish();
      }
    },
    prevStep() {
      this.step = this.step - 1;
    },
    goToTerms() {
      this.step = 2;
    },
    finish() {
      this.$bvModal.hide("initial-setup-modal");
      // this resets the modal to show words without flickering on modal disappear
      setTimeout(() => (this.step = 0), 1000);
    }
  },
  async created() {
    // only call getSeed when displaying secret modal
    this.$root.$on("bv::modal::shown", async (bvEvent, modalId) => {
      if (modalId === "initial-setup-modal") {
        await this.$store.dispatch("user/getSeed");
      }
    });
    // clear the seed from state after viewing
    this.$root.$on("bv::modal::hidden", async (bvEvent, modalId) => {
      if (modalId === "initial-setup-modal") {
        this.$store.dispatch("user/clearSeed");
      }
    });

    if (this.acknowledged) {
      this.step = 3;
    }
  },
  computed: {
    ...mapState({
      displayModal: state =>
        !state.system.acknowledged || state.bitcoin.initialblockdownload,
      acknowledged: state => state.system.acknowledged,
      initialblockdownload: state => state.bitcoin.initialblockdownload
    })
  },
  components: {
    Terms,
    BitcoinSyncingModal: BitcoinStillSyncingModal,
    SecretWordsDisplay,
    SecretWordsVerify
  }
};
</script>
