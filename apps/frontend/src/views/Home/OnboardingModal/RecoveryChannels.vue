<template>
  <div>
    <!-- Disable channel backup recovery if LND is not ready -->
    <recovery-lightning-is-syncing
      v-if="isLightningSyncing"
      :onConfirm="onClose"
    />

    <!-- Default loading state  -->
    <div v-else-if="step === 'loading'">
      <div class="d-flex align-items-center w-100 flex flex-column text-center p-3 pb-4">
        <h3>Recover your channels</h3>
        <div class="py-3 my-3 d-flex">
          <b-spinner variant="primary"></b-spinner>
        </div>
      </div>
    </div>

    <!-- Recovery: Select backup file -->
    <recovery-select-backup-file
      v-else-if="step === 'recovery-select-backup'"
      :timestamps="backups"
      :onSelect="(timestamp) => restoreBackup({timestamp, backupFile: null})"
      :onSkip="() => changeStep('recovery-upload-backup')"
      :onBack="onBack"
      :loading="isRestoringBackup"
      :disabled="isRestoringBackup"
    />

    <!-- Recovery: Upload backup file -->
    <recovery-upload-backup-file
      v-else-if="step === 'recovery-upload-backup'"
      :disabled="isRestoringBackup"
      :loading="isRestoringBackup"
      :onBack="() => backups.length ? changeStep('recovery-select-backup') : onBack()"
      :onNext="(file) => restoreBackup({timestamp: null, backupFile: file})"
      :torError="getBackupsFailedDueToTor"
      :retryWithoutTor="retryWithoutTor"
    />

  </div>
</template>

<script>
import { mapState } from "vuex";

import API from "@/helpers/api";
import getErrorMessage from "@/helpers/error-message";

import RecoveryLightningIsSyncing from '@/views/Home/OnboardingModal/RecoveryLightningIsSyncing.vue';
import RecoverySelectBackupFile from '@/views/Home/OnboardingModal/RecoverySelectBackupFile.vue';
import RecoveryUploadBackupFile from '@/views/Home/OnboardingModal/RecoveryUploadBackupFile.vue';


const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',').pop());
    reader.onerror = error => reject(error);
});

export default {
  props: {
    onComplete: Function,
    onBack: Function,
    onClose: Function,
  },
  data() {
    return {
      step: 'loading',
      uploadedBackupFile: null,
      isRestoringBackup: false,
    };
  },
  computed: {
    ...mapState({
      backups: state => state.lightning.backups,
      isLightningSyncing: state => !state.lightning.syncedToChain,
      getBackupsFailedDueToTor: state => state.lightning.getBackupsFailedDueToTor,
      backupOverTor: state => state.system.backupOverTor
    }),
  },
  methods: {
    changeStep(step) {
      this.step = step;
    },

    async getBackups() {
      try {
        await this.$store.dispatch("lightning/getBackups");
      } catch (err) {
        this.isGettingBackups = false;
        this.$bvToast.toast(
          getErrorMessage(
            err,
            "Unable to get channel backups. Please try again."
          ),
          {
            title: "Error",
            autoHideDelay: 3000,
            variant: "danger",
            solid: true,
            toaster: "b-toaster-bottom-right",
          }
        );
        return this.changeStep('recovery-upload-backup');
      }
      if (this.backups.length === 0) {
        return this.changeStep('recovery-upload-backup');
      }
      return this.changeStep('recovery-select-backup');
    },

    async retryWithoutTor() {
      const previousBackupOverTor = this.backupOverTor;

      this.changeStep('loading');

      try {
        if (previousBackupOverTor) {
          await this.$store.dispatch('system/changeBackupOverTor', false);
        }
        await this.getBackups();
      } finally {
        if (this.backupOverTor !== previousBackupOverTor) {
          await this.$store.dispatch(
            'system/changeBackupOverTor',
            previousBackupOverTor
          );
        }
      }
    },

    async restoreBackup({ timestamp, backupFile }) {
      this.isRestoringBackup = true;
      try {
        if (backupFile) {
          const backupFileBase64 = await toBase64(backupFile);
          await API.post(`${process.env.VUE_APP_API_BASE_URL}/v1/lnd/backups/recover`, { backup: backupFileBase64 });
        } else {
          await API.post(`${process.env.VUE_APP_API_BASE_URL}/v1/lnd/backups/recover`, { timestamp });
        }
      } catch (err) {
        this.$bvToast.toast(
          getErrorMessage(
            err,
            "Unable to recover channel backup. Please try again."
          ),
          {
            title: "Error",
            autoHideDelay: 3000,
            variant: "danger",
            solid: true,
            toaster: "b-toaster-bottom-right",
          }
        );
        return this.isRestoringBackup = false;
      }
      this.isRestoringBackup = false;
      return this.onComplete();
    },
  },
  created() {
    this.getBackups();
  },
  components: {
    RecoveryLightningIsSyncing,
    RecoverySelectBackupFile,
    RecoveryUploadBackupFile,
  }
};
</script>

<style lang="scss"></style>
