<template>
  <b-modal id="tor-backup-failed-modal" size="lg" centered hide-footer no-close-on-backdrop no-close-on-esc hide-header>
    <!-- <template v-slot:modal-header="{ close }">
    </template> -->
    <div class="px-2 px-sm-3 pt-2 d-flex justify-content-center w-100">
      <h3 class="text-center">Channel Backup Failure</h3>
    </div>
    <div class="px-2 px-sm-3 pb-2 pb-sm-3 d-flex flex-column align-items-center">
      <p class="h1">
        <b-icon icon="exclamation-circle" variant="warning"></b-icon>
      </p>
      <div class="w-100 text-center">
        <p>
          The last backup of your payment channels was unsuccessful. This is likely due to the Tor network being unreachable or congested. You can disable Tor temporarily to continue seamless backups of your channels.
        </p>
      </div>

      <!-- two buttons for tor vs clearnet -->
      <div class="d-flex flex-column flex-lg-row justify-content-center w-100 mt-2">
        <b-button
          variant="outline-secondary"
          :disabled="loading"
          :class="{'fade-in-out': loading}"
          class="btn-border w-100"
          @click="$bvModal.hide('tor-backup-failed-modal')"
          >Keep Tor Enabled</b-button>
        <b-button
          variant="success"
          :disabled="loading"
          :class="{'fade-in-out': loading}"
          class="ml-lg-2 mt-lg-0 mt-2 w-100"
          @click="disableTorAndCloseModal"
        >Disable Tor</b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      loading: false
    };
  },
  computed: {
    ...mapState({
      backupOverTor: state => state.system.backupOverTor
    })
  },
  methods: {
    async disableTorAndCloseModal() {
      this.loading = true;
      await this.$store.dispatch('system/toggleBackupOverTor');
      this.$bvModal.hide('tor-backup-failed-modal');
    }
  }
};
</script>

<style lang="scss" scoped>
.btn-border {
  border: solid 1px !important;
}
</style>
