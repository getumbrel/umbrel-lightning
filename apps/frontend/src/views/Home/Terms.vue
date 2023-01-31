<template>
  <div
    class="py-3 px-2 d-flex align-items-center w-100 flex flex-column text-center"
  >
    <h3>Before we begin...</h3>
    <p>A word of caution.</p>
    <p class="h1">
      <b-icon icon="exclamation-circle" variant="warning"></b-icon>
    </p>
    <p class="mb-4 w-75">
      Lightning Network is an experimental technology. This app is in beta and
      it is considered #reckless to put any life altering amounts of BTC into
      the network.
    </p>
    <b-button
      variant="success"
      href="#"
      class="text-center mt-3 mb-2"
      :class="{ 'fade-in-out': sendingRequest }"
      v-on:click.stop.prevent="acknowledgeTerms"
    >
      I understand &amp; agree
    </b-button>
  </div>
</template>

<script>
import delay from "@/helpers/delay";

export default {
  props: {
    onAgree: Function
  },
  data() {
    return {
      sendingRequest: false
    };
  },
  methods: {
    async acknowledgeTerms() {
      this.onAgree();
      this.sendingRequest = true;
      // add delay so we can close the modal first
      // and then send the request once it's closed
      await delay(1000);
      await this.$store.dispatch("system/onboardingComplete");
      this.sendingRequest = false;
    }
  }
};
</script>
