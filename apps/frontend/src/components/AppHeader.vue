<template>
  <div class="d-flex justify-content-start align-items-center mb-4">
    <img
      class="mr-3"
      style="height: 6rem; width: 6rem"
      src="@/assets/icon-app-lnd.svg"
    />
    <div>
      <div class="d-flexalign-items-center">
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="4" cy="4" r="4" fill="#00CD98" />
        </svg>
        <small class="ml-1 text-success">{{ status }}</small>
      </div>
      <h3 class="font-weight-bold mb-1">
        Lightning Network Daemon
      </h3>
      <span class="text-sm text-muted font-medium">
        {{
          this.lndVersion ? `v${this.lndVersion.split(" commit")[0]}` : "..."
        }}
      </span>
    </div>
  </div>
</template>

<script>
// import Vue from "vue";
import { mapState } from "vuex";

export default {
  data() {
    return {
      status: "Running",
    };
  },
  computed: {
    ...mapState({
      lndVersion: (state) => state.lightning.version,
    }),
  },
  created() {
    this.$store.dispatch("lnd/getVersion");
  },
};
</script>
