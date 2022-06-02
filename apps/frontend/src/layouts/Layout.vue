<template>
  <div class="content-container px-2">
    <transition name="change-page" mode="out-in">
    <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { mapState } from "vuex";
import API from "@/helpers/api";

export default {
  computed: {
    ...mapState({
      name: (state) => state.user.name,
      chain: (state) => state.bitcoin.chain,
    }),
  },
  methods: {
    logout() {
      this.$store.dispatch("user/logout");
    },
    fetchData() {
      this.$store.dispatch("system/getUnit");
      this.$store.dispatch("bitcoin/getSync");
      this.$store.dispatch("bitcoin/getBalance");
      this.$store.dispatch("bitcoin/getTransactions");
      this.$store.dispatch("lightning/getSync");
      this.$store.dispatch("lightning/getTransactions");
      this.$store.dispatch("lightning/getChannels");
    },
    async downloadChannelBackup() {
      await API.download(
        `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/util/download-channel-backup`,
        {},
        true,
        "my-umbrel-channels.backup"
      );
    },
  },
  created() {
    //refresh this data every 20s:
    this.fetchData();
    this.interval = window.setInterval(this.fetchData, 20000);
  },
  beforeDestroy() {
    window.clearInterval(this.interval);
    if (this.pollUpdateStatus) {
      window.clearInterval(this.pollUpdateStatus);
    }
  },
  watch: {},
  components: {},
};
</script>

<style lang="scss" scoped>
.content-container {
  display: block;
  width: 100%;
  max-width: 1374px;
  margin: auto;
}

// Page changing transitions
.change-page-enter-active,
.change-page-leave-active {
  transition: transform 0.4s, opacity 0.4s ease;
}
.change-page-enter {
  transform: translate3d(-40px, 0, 0);
  opacity: 0;
}
.change-page-enter-to {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}
.change-page-leave {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}
.change-page-leave-to {
  transform: translate3d(40px, 0, 0);
  opacity: 0;
}
</style>
