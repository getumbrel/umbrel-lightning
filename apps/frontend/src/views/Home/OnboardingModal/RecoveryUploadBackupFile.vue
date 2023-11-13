<template>
  <div class="d-flex align-items-center w-100 flex flex-column text-center p-3 pb-4">
    <h3>Recover your channels</h3>
    <b-alert v-if="torError" variant="warning" show class="mb-3 d-flex align-items-center flex-column">
      <small class="d-block mt-1">
        <b-icon class="" icon="exclamation-triangle-fill"></b-icon>
        Error downloading your backup files.
      </small>
      <small class="d-block mt-1">
        We were unable to download your latest backup files. This is likely due to the Tor network being either unreachable or congested.
        To resolve this, you can disable the 'Backup over Tor' option in settings. This will allow you to backup and recover your channels more reliably without depending on Tor.
        If you wish, you can also try to retrieve your backup files once without using Tor by clicking the button below.
      </small>
      <b-button
        variant="primary px-4"
        :disabled="disabled"
        :class="{'fade-in-out': loading}"
        class="mt-2"
        @click="retryWithoutTor"
      >Retry without Tor</b-button>
    </b-alert>

    <p>
      {{ torError ? 'Or upload your payments channel backup file.' : 'Or upload your payments channel backup file.' }}
    </p>

    <b-form-file
      class="upload-input mt-3 mb-5"
      v-model="uploadedFile"
      placeholder="Choose your backup file or drop it here..."
      drop-placeholder="Drop file here..."
    ></b-form-file>
    <div>
      <b-button
        variant="success px-4"
        :class="{'fade-in-out': loading}"
        :disabled="disabled"
        @click="() => onNext(uploadedFile)"
      >Next</b-button>
      <div class="mt-3">
        <a
          href="#"
          class="text-center text-uppercase"
          :class="{'disabled-link': loading}"
          @click.prevent="onBack">
          Back
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      uploadedFile: null,
    }
  },
  props: {
    disabled: Boolean,
    loading: Boolean,
    uploadedBackupFile: File,
    onBack: Function,
    onNext: Function,
    torError: Boolean,
    retryWithoutTor: Function
  },
};
</script>

<style lang="scss">
.upload-input {
  height: 300px;
  .custom-file-label {
    height: 300px;
    line-height: 250px;
    &::before {
      content: url('/icon-upload-arrows.svg');
      position: absolute;
      top: 50%;
      right: 50%;
      transform: translate(50%, -70%);
      display: block;
    }
    &::after {
      top: 50%;
      right: 50%;
      transform: translate(50%, 50%);
      border: none;
      border-radius: 0.25rem;
    }
  }
}
</style>