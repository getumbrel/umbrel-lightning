<template>
  <b-modal
    id="bitcoin-syncing-modal"
    size="xl"
    v-model="this.displayModal"
    centered
    hide-footer
    hide-header
    no-close-on-esc
    no-close-on-backdrop
  >
    <template>
      <div
        class="py-3 px-2 d-flex align-items-center w-100 flex flex-column text-center"
      >
        <h2 class="lowercase">almost there...</h2>
        <p class="h1 mb-4 mt-3">
          <img
            style="height: 6rem; width: 6rem"
            src="@/assets/icon-app-bitcoin.svg"
          />
        </p>
        <p class="mb-4 w-75">
          Your Lightning node will be ready to use once Bitcoin Core has
          finished syncing. Please check back later.
        </p>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState({
      // only display if we are synced to change and user has gone through onboarding flow
      displayModal: state => !state.lightning.syncedToChain && state.system.acknowledged;
    })
  }
};
</script>
