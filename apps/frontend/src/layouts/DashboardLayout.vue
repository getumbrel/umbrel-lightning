<template>
  <div>
    <b-row class="mx-0">
      <b-col col lg="12">
        <div class="content-container">
          <transition name="change-page" mode="out-in">
            <!-- Content -->
            <router-view></router-view>
          </transition>
        </div>

        <!-- Footer -->
        <footer class="d-flex justify-content-end text-muted pr-sm-2 pr-xl-3">
          <p>
            <small>
              <a href="https://getumbrel.com" target="_blank">getumbrel.com</a>
              |
              <a href="https://community.getumbrel.com" target="_blank"
                >community</a
              >
            </small>
          </p>
        </footer>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import API from "@/helpers/api";

export default {
  computed: {
    ...mapState({
      name: state => state.user.name,
      chain: state => state.bitcoin.chain
    })
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
    toggleMobileMenu() {
      this.$store.commit("toggleMobileMenu");
    },
    async downloadChannelBackup() {
      await API.download(
        `${process.env.VUE_APP_BACKEND_URL}/v1/lnd/util/download-channel-backup`,
        {},
        true,
        "my-umbrel-channels.backup"
      );
    }
  },
  created() {
    //load this data once:
    this.$store.dispatch("user/getInfo");

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
  components: {}
};
</script>

<style lang="scss" scoped>
.nav-horizontal {
  background: #fff;
  position: sticky;
  z-index: 9;
}

.nav-horizontal {
  top: 0;
}

.content-container {
  min-height: calc(100vh - 150px);
}

.input-search-form {
  form {
    position: relative;
  }
  .input-search {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    width: calc(100vw - 200px);
    max-width: 600px;
    font-size: 1rem;
    margin-left: 1rem;
  }
  .input-search-icon {
    content: url("~@/assets/icon-search.svg");
    position: absolute;
    top: calc(50% - 0.625rem);
    left: -0.25rem;
    height: 1.25rem;
    width: auto;
  }
}

::-webkit-input-placeholder {
  /* Edge */
  color: #c3c6d1;
}

:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: #c3c6d1;
}

::placeholder {
  color: #c3c6d1;
}

.nav-hamburger-icon {
  width: 24px;
  cursor: pointer;
  &:before,
  &:after,
  div {
    background-color: #c3c6d1;
    border-radius: 3px;
    content: "";
    display: block;
    height: 4px;
    width: 100%;
    margin: 5px 0;
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  div {
    width: 20px;
    margin-left: 4px;
  }
  &.active {
    &:before {
      transform: translateY(9px) rotate(135deg);
    }
    &:after {
      transform: translateY(-9px) rotate(-135deg);
    }
    div {
      transform: scale(0);
    }
  }
}

.mobile-vertical-menu {
  position: fixed;
  z-index: 9;
  top: 84px;
  right: 0;
  width: 80vw;
  max-width: 280px;
  height: calc(var(--vh100, 100vh) - 84px);
  background: #fff;
  box-shadow: 0px 10px 30px rgba(209, 213, 223, 0.5);
  transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1);
}

.mobile-vertical-menu-enter {
  // opacity: 0;
  transform: translate3d(100%, 0, 0);
}
.mobile-vertical-menu-enter-to {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
.mobile-vertical-menu-leave {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
.mobile-vertical-menu-leave-to {
  // opacity: 0;
  transform: translate3d(100%, 0, 0);
}

.mobile-vertical-menu-fader {
  position: fixed;
  height: var(--vh100, 100vh);
  width: 100vw;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 1);
  z-index: 8;
  opacity: 0.1;
  transition: opacity 0.6s ease-in-out;
}

.mobile-vertical-menu-fader-enter {
  opacity: 0;
}
.mobile-vertical-menu-fader-enter-to {
  opacity: 0.1;
}
.mobile-vertical-menu-fader-leave {
  opacity: 0.1;
}
.mobile-vertical-menu-fader-leave-to {
  opacity: 0;
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
