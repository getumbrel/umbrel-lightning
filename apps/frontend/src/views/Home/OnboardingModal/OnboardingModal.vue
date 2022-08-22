<template>
  <b-modal
    id="onboarding-modal"
    :size="onboarding && (step === 'recovery-enter-words' || step === 'recovery-select-backup' || step === 'recovery-upload-backup' || step === 'show-secret-words' || step === 'verify-secret-words') ? 'lg' : 'md'"
    centered
    hide-footer
    hide-header
    no-close-on-esc
    no-close-on-backdrop
    v-model="this.displayModal"
  >
   
    <div v-if="onboarding">

      <!-- Welcome -->
      <welcome
        v-if="step === 'welcome'"
        :onRecoverNode="() => changeStep('recovery-enter-words')"
        :onNewNode="createWallet"
        :disabled="isCreatingWallet"
        :loading="isCreatingWallet"
      />

      <!-- Recovery: Enter seed -->
      <recovery-enter-words
        v-else-if="step === 'recovery-enter-words'"
        :recoveryWords="recoveryWords"
        :onBack="() => changeStep('welcome')"
        :onNext="createWallet"
        :disabled="recoveryWords.length !== 24 || isCreatingWallet"
        :loading="isCreatingWallet"
      />

      <!-- Recovery: Confirm if open channels -->
      <recovery-confirm-open-channels
        v-else-if="step === 'recovery-confirm-open-channels'"
        :onNo="() => changeStep('terms')"
        :onYes="() => changeStep('recovery-channels')"
      />

      <!-- Recovery: Select or upload channel backup file -->
      <recovery-channels
        v-else-if="step === 'recovery-channels'"
        :onComplete="channelRecoveryInitiated"
        :onBack="() => changeStep('recovery-confirm-open-channels')"
      />

      <secret-words-display
        v-else-if="step === 'show-secret-words'"
        :nextStep="() => changeStep('verify-secret-words')"
        :skipVerify="() => changeStep('terms')"
      />

      <secret-words-verify
        v-else-if="step === 'verify-secret-words'"
        :nextStep="() => changeStep('terms')"
        :prevStep="() => changeStep('show-secret-words')"
      />

      <terms
        v-else
        :onAgree="finishOnboarding"
      />
    
    </div>
    
    <bitcoin-sync-modal v-else-if="initialblockdownload" />
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

import API from "@/helpers/api";
import delay from "@/helpers/delay";

import SecretWordsDisplay from "@/views/Home/SecretWordsDisplay.vue";
import SecretWordsVerify from "@/views/Home/SecretWordsVerify.vue";
import Terms from "@/views/Home/Terms.vue";
import BitcoinSyncModal from "@/views/Home/BitcoinSyncModal";
import Welcome from '@/views/Home/OnboardingModal/Welcome.vue';
import RecoveryEnterWords from '@/views/Home/OnboardingModal/RecoveryEnterWords.vue';
import RecoveryConfirmOpenChannels from '@/views/Home/OnboardingModal/RecoveryConfirmOpenChannels.vue';
import RecoveryChannels from '@/views/Home/OnboardingModal/RecoveryChannels.vue';

export default {
  data() {
    return {
      step: 'welcome',
      uploadedBackupFile: null,
      recoveryWords: [],
      isCreatingWallet: false,
    };
  },
  computed: {
    ...mapState({
      displayModal: state => state.system.onboarding || state.bitcoin.initialblockdownload,
      onboarding: state => state.system.onboarding,
      initialblockdownload: state => state.bitcoin.initialblockdownload,
      seedExists: state => state.system.seedExists,
      seed: state => state.user.seed
    }),
  },
  methods: {
    changeStep(step) {
      this.step = step;
    },
    
    async createWallet() {
      this.isCreatingWallet = true;
      try {
        if (this.recoveryWords.length) {
          await API.post(`${process.env.VUE_APP_API_BASE_URL}/v1/lnd/wallet/create`, { seed: this.recoveryWords.join(" ") });
        } else {
          await API.post(`${process.env.VUE_APP_API_BASE_URL}/v1/lnd/wallet/create`);
        }
      } catch (err) {
        this.isCreatingWallet = false;
        this.$bvToast.toast(err.response && err.response.data ? err.response.data : err, {
          title: "Error",
          autoHideDelay: 3000,
          variant: "danger",
          solid: true,
          toaster: "b-toaster-bottom-right",
        });
        return;
      }

      this.isCreatingWallet = false;
      if (this.recoveryWords.length) {
        return this.changeStep('recovery-confirm-open-channels');
      }

      /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
      while (true) {
        await this.$store.dispatch("user/getSeed");
        if (this.seed.length) {
          break;
        }
        await delay(1000);
      }

      return this.changeStep('show-secret-words');
    },

    channelRecoveryInitiated() {
      this.$bvToast.toast("Once your channels start closing, it may take upto 2 days for the funds to arrive in your Bitcoin (on-chain) wallet.", {
        title: "Channel recovery initiated",
        autoHideDelay: 6000,
        variant: "success",
        solid: true,
        toaster: "b-toaster-bottom-right",
      });
      return this.changeStep("terms");
    },

    finishOnboarding() {
      if (this.initialblockdownload) {
        return;
      }
      this.$bvModal.hide("onboarding-modal");
      setTimeout(() => (this.step = 'welcome'), 1000);
    },
  },
  async created() {
    if (this.onboarding && this.seedExists) {
      this.step = 'terms';
    }
  },
  components: {
    Terms,
    BitcoinSyncModal,
    SecretWordsDisplay,
    SecretWordsVerify,
    Welcome,
    RecoveryEnterWords,
    RecoveryConfirmOpenChannels,
    RecoveryChannels,
  }
};
</script>

<style lang="scss"></style>