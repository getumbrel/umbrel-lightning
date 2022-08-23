<template>
  <div class="d-flex align-items-center w-100 flex flex-column text-center p-3 pb-4">
    <h2 class="text-lowercase">Recover your channels</h2>
    <p>
      The payment channels of your Lightning Node were periodically backed up.
    </p>
    <p>
      Please make sure to select the backup file from the last time your previous Lightning Node was online.
    </p>
    <div class="backup-files py-3 mb-3 d-flex">
      <div
        v-for="timestamp in timestamps"
        :key="timestamp"
        class="backup-file mx-1"
        @click="selectBackup(timestamp)"
      >
      <img
        class="icon-backup-file mx-3"
        src="@/assets/icon-backup-file.svg"
      />
      <small class="d-block mt-2">{{ getTime(timestamp) }}</small>
      <small class="d-block">{{ getDate(timestamp) }}</small>
      </div>
    </div>
    <p class="text-muted">Or upload your own channel backup file</p>
    <div>
      <b-button
        variant="primary px-4"
        :disabled="disabled"
        :class="{'fade-in-out': loading}"
        @click="onSkip"
      >Upload</b-button>
      <div class="mt-3">
        <a
          href="#"
          class="text-center text-uppercase"
          :class="{'disabled-link': disabled}"
          @click.prevent="onBack"
        >
          Back
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: {
    disabled: Boolean,
    loading: Boolean,
    timestamps: Array,
    onSelect: Function,
    onSkip: Function,
    onBack: Function,
  },
  methods: {
    getTime(timestamp) {
      return moment(timestamp).format("h:mm a"); // eg. "3:03 pm March 08, 2020"
    },

    getDate(timestamp) {
      return moment(timestamp).format("MMM D, YYYY"); // eg. "3:03 pm March 08, 2020"
    },

    selectBackup(timestamp) {
      if (!window.confirm(`Are you sure you want to recover your Lightning channels from the backup made on ${this.getDate(timestamp)} at ${this.getTime(timestamp)}?`)) {
        return;
      }
      return this.onSelect(timestamp);
    }
  }
};
</script>

<style lang="scss" scoped>
.backup-files {
  background: #F9FAFA;
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
  width: calc(100% + 5rem);
  .backup-file {
    .icon-backup-file {
      width: 80px;
      cursor: pointer;
      transition: transform 0.3s ease;
      &:hover {
        transform: scale3d(1.05 , 1.05 , 1.05 );
      }
    }
  }
}
</style>