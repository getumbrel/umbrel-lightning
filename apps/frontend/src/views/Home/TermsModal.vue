<template>
  <b-modal
    id="terms-modal"
    size="xl"
    v-model="showModal"
    centered
    hide-footer
    hide-header
    no-close-on-esc
    no-close-on-backdrop
  >
    <template #default="{ hide }">
      <div
        class="py-3 px-2 d-flex align-items-center w-100 flex flex-column text-center"
      >
        <h2 class="lowercase">before we begin...</h2>
        <p>A word of caution.</p>
        <p class="h1">
          <b-icon icon="exclamation-circle" variant="warning"></b-icon>
        </p>
        <p class="mb-4 w-75">
          Lightning Network is an experimental technology. This app is in beta
          and it is it is considered #reckless to put any life altering amounts
          of BTC into the network.
        </p>
        <b-button
          variant="success"
          href="#"
          class="text-center mt-3"
          v-on:click.stop.prevent="acknowledgeTerms"
        >
          {{ sendingRequest ? "Agreeing..." : "I agree" }}
        </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      sendingRequest: false
    };
  },
  methods: {
    async acknowledgeTerms() {
      console.log("this.$refs: ", this.$refs);
      this.sendingRequest = true;
      await this.$store.dispatch("system/setTermsAcknowledgeStatus");
      this.sendingRequest = false;
      this.showModal = false;
    }
  },
  computed: {
    ...mapState({
      showModal: state => {
        console.log("state: ", state);
        console.log("state.system.acknowledged: ", state.system.acknowledged);
        return !state.system.acknowledged;
      }
    })
  }
};
</script>
