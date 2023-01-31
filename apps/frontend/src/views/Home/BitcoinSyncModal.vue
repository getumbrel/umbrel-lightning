<template>
  <div
    class="py-3 px-2 d-flex align-items-center w-100 flex flex-column text-center"
  >
    <h3>Almost there...</h3>
    <p class="h1 mb-4 mt-3">
      <img
        style="height: 7rem; width: 7rem; border-radius: 22%;"
        src="@/assets/icon-app-bitcoin.svg"
      />
    </p>
    <p class="mb-4 w-75">
      Your Lightning node will be ready to use once your Bitcoin node has finished
      syncing. Please check back later.
    </p>
  </div>
</template>

<script>
export default {
  methods: {
    fetchBitcoinSync() {
      this.$store.dispatch("bitcoin/getSync");
    }
  },
  created() {
    this.fetchBitcoinSync();
    this.interval = window.setInterval(this.fetchBitcoinSync, 10000);
  },
  beforeDestroy() {
    window.clearInterval(this.interval);
  }
};
</script>
