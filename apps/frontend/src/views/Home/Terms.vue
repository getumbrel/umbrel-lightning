<template>
  <div
    class="py-3 px-2 d-flex align-items-center w-100 flex flex-column text-center"
  >
    <h2>before we begin...</h2>
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
      class="text-center mt-3"
      :class="{ 'fade-in-out': sendingRequest }"
      v-on:click.stop.prevent="acknowledgeTerms"
    >
      I understand &amp; agree
    </b-button>
  </div>
</template>

<script>
export default {
  props: {
    afterRequest: Function
  },
  data() {
    return {
      sendingRequest: false
    };
  },
  methods: {
    async acknowledgeTerms() {
      this.sendingRequest = true;
      await this.$store.dispatch("system/onboardingComplete");
      this.sendingRequest = false;
      this.afterRequest();
    }
  }
};
</script>

