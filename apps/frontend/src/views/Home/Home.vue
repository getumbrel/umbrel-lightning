<template>
  <div class="py-4 px-2">
    <div class="pb-2">
      <div
        class="d-flex flex-wrap justify-content-between align-items-center mb-2"
      >
        <div class="d-flex flex-grow-1 justify-content-start align-items-center mb-4">
          <img
            class="app-icon mr-2 mr-sm-3"
            src="@/assets/icon.svg"
          />
          <div>
            <div class="d-flex align-items-center">
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
              Lightning Node
            </h3>
            <span class="text-sm text-muted font-medium">
              {{
                this.lndVersion ? `LND ${this.lndVersion.split(" commit")[0]}` : "..."
              }}
            </span>
          </div>
        </div>

        <div class="d-flex justify-content-between justify-content-sm-start w-xs-100">
          <b-dropdown
            class="ml-3"
            variant="link"
            toggle-class="text-decoration-none p-0"
            no-caret
            right
          >
            <template v-slot:button-content>
              <svg
                width="18"
                height="4"
                viewBox="0 0 18 4"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2 4C3.10457 4 4 3.10457 4 2C4 0.89543 3.10457 0 2 0C0.89543 0 0 0.89543 0 2C0 3.10457 0.89543 4 2 4Z"
                  fill="#6c757d"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9 4C10.1046 4 11 3.10457 11 2C11 0.89543 10.1046 0 9 0C7.89543 0 7 0.89543 7 2C7 3.10457 7.89543 4 9 4Z"
                  fill="#6c757d"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16 4C17.1046 4 18 3.10457 18 2C18 0.89543 17.1046 0 16 0C14.8954 0 14 0.89543 14 2C14 3.10457 14.8954 4 16 4Z"
                  fill="#6c757d"
                />
              </svg>
            </template>
            <b-dropdown-item href="#" v-b-modal.lightning-address-modal
              >Lightning address</b-dropdown-item
            >
            <b-dropdown-item href="#" v-b-modal.connect-wallet-modal @click="getLndConnectUrls"
              >Connect wallet</b-dropdown-item
            >
            <b-dropdown-item href="#" v-b-modal.secret-words-modal
              >View secret words</b-dropdown-item
            >
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item href="#" @click.stop.prevent="recoverChannels"
              >Recover channels</b-dropdown-item
            >
            <b-dropdown-item href="#" @click.stop.prevent="downloadChannelBackup"
              >Download channel backup file</b-dropdown-item
            >
            <b-dropdown-group>
              <div class="dropdown-group">
                <div class="d-flex w-100 justify-content-between">
                  <div>
                    <span class="d-block">Automatic backups</span>
                    <small class="d-block">
                      <a
                        href="https://github.com/getumbrel/umbrel/blob/master/scripts/backup/README.md"
                        target="blank"
                        >Learn more</a
                      >
                    </small>
                  </div>
                  <toggle-switch
                    class="align-self-center"
                    disabled
                    tooltip="Sorry, automatic backups cannot be disabled for now"
                  ></toggle-switch>
                </div>
                <small
                  v-if="backupStatus.status"
                  class="d-block mt-2"
                  style="opacity: 0.4"
                >
                  Last backup
                  <span v-if="backupStatus.status === 'failed'">failed</span>
                  at {{ getReadableTime(backupStatus.timestamp) }}
                </small>
              </div>
            </b-dropdown-group>
            <!-- <b-dropdown-divider /> -->
            <!-- <b-dropdown-item variant="danger" href="#" disabled>Stop LND</b-dropdown-item> -->
          </b-dropdown>
        </div>
      </div>

      <!-- Recovery progress  -->
      <div
        v-if="recoveryInfo.recoveryMode && recoveryInfo.progress < 1"
        class="mb-4 py-1"
        variant=""
      >
        Scanning all transactions for recovery. This may take a while...
        <b-progress
          :value="recoveryInfo.progress * 100"
          class="my-2 w-100"
          variant="purple"
          :style="{ height: '4px' }"
        ></b-progress>
      </div>

    </div>

    <b-row class="row-eq-height">
      <b-col col cols="12" sm="6" lg="4">
        <bitcoin-wallet />
      </b-col>
      <b-col col cols="12" sm="6" lg="4">
        <lightning-wallet />
      </b-col>
      <b-col col cols="12" sm="5" lg="4">
        <total-balance />
        <card-widget header="Summary">
          <div class="px-3 px-lg-4 pb-2">
            <b-row>
              <b-col col cols="6">
                <stat
                  title="Connections"
                  :value="numPeers"
                  suffix="Peers"
                  showNumericChange
                ></stat>
              </b-col>
              <b-col col cols="6">
                <stat
                  title="Channels"
                  :value="numActiveChannels"
                  suffix="Channels"
                  showNumericChange
                ></stat>
              </b-col>
              <b-col col cols="6">
                <stat
                  title="Max Send"
                  :value="maxSend | unit"
                  :suffix="unit | formatUnit"
                  :hasDecimals="unit === 'btc'"
                  abbreviateValue
                ></stat>
              </b-col>
              <b-col col cols="6">
                <stat
                  title="Max Receive"
                  :value="maxReceive | unit"
                  :suffix="unit | formatUnit"
                  :hasDecimals="unit === 'btc'"
                  abbreviateValue
                ></stat>
              </b-col>
            </b-row>
          </div>
        </card-widget>
      </b-col>
      <b-col col cols="12" sm="7" lg="12">
        <card-widget header="Payment Channels">
          <template v-slot:header-right>
            <b-button
              variant="outline-primary"
              size="sm"
              v-b-modal.open-channel-modal
              >+ Open Channel</b-button
            >
          </template>
          <div class>
            <b-modal
              id="open-channel-modal"
              ref="open-channel-modal"
              size="lg"
              centered
              hide-footer
            >
              <template v-slot:modal-header="{ close }">
                <div
                  class="px-2 px-sm-3 pt-2 d-flex justify-content-between w-100"
                >
                  <h2>open channel</h2>
                  <!-- Emulate built in modal header close button action -->
                  <a
                    href="#"
                    class="align-self-center"
                    v-on:click.stop.prevent="close"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M13.6003 4.44197C13.3562 4.19789 12.9605 4.19789 12.7164 4.44197L9.02116 8.1372L5.32596 4.442C5.08188 4.19792 4.68615 4.19792 4.44207 4.442C4.198 4.68607 4.198 5.0818 4.44207 5.32588L8.13728 9.02109L4.44185 12.7165C4.19777 12.9606 4.19777 13.3563 4.44185 13.6004C4.68592 13.8445 5.08165 13.8445 5.32573 13.6004L9.02116 9.90497L12.7166 13.6004C12.9607 13.8445 13.3564 13.8445 13.6005 13.6004C13.8446 13.3563 13.8446 12.9606 13.6005 12.7165L9.90505 9.02109L13.6003 5.32585C13.8444 5.08178 13.8444 4.68605 13.6003 4.44197Z"
                        fill="#6c757d"
                      />
                    </svg>
                  </a>
                </div>
              </template>
              <div class="px-2 px-sm-3 py-2">
                <channel-open v-on:channelopen="onChannelOpen"></channel-open>
              </div>
            </b-modal>

            <!-- manage channel modal -->
            <b-modal
              id="manage-channel-modal"
              ref="manage-channel-modal"
              size="lg"
              centered
              hide-footer
            >
              <template v-slot:modal-header="{ close }">
                <div
                  class="px-2 px-sm-3 pt-2 d-flex justify-content-between w-100"
                >
                  <h2>channel details</h2>
                  <!-- Emulate built in modal header close button action -->
                  <a
                    href="#"
                    class="align-self-center"
                    v-on:click.stop.prevent="close"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M13.6003 4.44197C13.3562 4.19789 12.9605 4.19789 12.7164 4.44197L9.02116 8.1372L5.32596 4.442C5.08188 4.19792 4.68615 4.19792 4.44207 4.442C4.198 4.68607 4.198 5.0818 4.44207 5.32588L8.13728 9.02109L4.44185 12.7165C4.19777 12.9606 4.19777 13.3563 4.44185 13.6004C4.68592 13.8445 5.08165 13.8445 5.32573 13.6004L9.02116 9.90497L12.7166 13.6004C12.9607 13.8445 13.3564 13.8445 13.6005 13.6004C13.8446 13.3563 13.8446 12.9606 13.6005 12.7165L9.90505 9.02109L13.6003 5.32585C13.8444 5.08178 13.8444 4.68605 13.6003 4.44197Z"
                        fill="#6c757d"
                      />
                    </svg>
                  </a>
                </div>
              </template>
              <div class="px-2 px-sm-3 py-2">
                <channel-manage
                  :channel="selectedChannel"
                  v-on:channelclose="onChannelClose"
                ></channel-manage>
              </div>
            </b-modal>

            <channel-list v-on:selectchannel="manageChannel"></channel-list>
          </div>
        </card-widget>
      </b-col>
    </b-row>

    <!-- Modals  -->
    <onboarding-modal />
    <b-modal
      v-if="showRecoverChannelsModal"
      id="recover-channels-modal"
      size="lg"
      centered
      hide-header
      hide-footer
    >
      <recovery-channels
        :onComplete="channelRecoveryInitiated"
        :onBack="() => this.$bvModal.hide('recover-channels-modal')"
      />
    </b-modal>
    <lightning-address-modal />
    <secret-words-modal />
    <connect-wallet-modal />
  </div>
</template>

<script>
import { mapState } from "vuex";
import moment from "moment";

import API from "@/helpers/api";
import delay from "@/helpers/delay";

import CardWidget from "@/components/CardWidget";
import Stat from "@/components/Utility/Stat";
import LightningWallet from "@/components/LightningWallet";
import BitcoinWallet from "@/components/BitcoinWallet";
import TotalBalance from "@/components/TotalBalance";
import ToggleSwitch from "@/components/ToggleSwitch";
import ChannelList from "@/components/Channels/List";
import ChannelOpen from "@/components/Channels/Open";
import ChannelManage from "@/components/Channels/Manage";

import LightningAddressModal from "./LightningAddressModal.vue";
import SecretWordsModal from "./SecretWordsModal.vue";
import ConnectWalletModal from "./ConnectWalletModal";
import OnboardingModal from "./OnboardingModal/OnboardingModal.vue";
import RecoveryChannels from '@/views/Home/OnboardingModal/RecoveryChannels.vue';

export default {
  data() {
    return {
      status: "Running",
      selectedChannel: {},
      showRecoverChannelsModal: false
    };
  },
  computed: {
    ...mapState({
      lndVersion: state => state.lightning.version,
      recoveryInfo: state => state.lightning.recoveryInfo,
      numActiveChannels: state => state.lightning.numActiveChannels,
      maxReceive: state => state.lightning.maxReceive,
      maxSend: state => state.lightning.maxSend,
      numPeers: state => state.lightning.numPeers,
      alias: state => state.lightning.alias,
      pubkey: state => state.lightning.pubkey,
      lndConnectUrls: state => state.lightning.lndConnectUrls,
      channels: state => state.lightning.channels,
      unit: state => state.system.unit,
      backupStatus: state => state.system.backupStatus,
    })
  },
  methods: {
    getReadableTime(timestamp) {
      return moment(timestamp).format("MMM D, h:mm:ss a");
    },
    async downloadChannelBackup() {
      await API.download(
        `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/util/download-channel-backup`,
        {},
        true,
        "my-umbrel-channels.backup"
      );
    },
    async recoverChannels() {
      this.showRecoverChannelsModal = true;
      // add delay to make sure that
      // the modal component is mounted
      await delay(300);
      this.$bvModal.show("recover-channels-modal");
    },
    channelRecoveryInitiated() {
      this.$bvToast.toast("Once your channels start closing, it may take upto 2 days for the funds to arrive in your Bitcoin (on-chain) wallet.", {
        title: "Channel recovery initiated",
        autoHideDelay: 6000,
        variant: "success",
        solid: true,
        toaster: "b-toaster-bottom-right",
      });
      return this.$bvModal.hide('recover-channels-modal');
    },
    getLndConnectUrls() {
      this.$store.dispatch("lightning/getLndConnectUrls");
    },
    manageChannel(channel) {
      if (channel) {
        this.selectedChannel = channel;
        this.$refs["manage-channel-modal"].show();
      }
    },
    onChannelOpen() {
      //refresh channels, balance and txs
      this.fetchData();
      this.$refs["open-channel-modal"].hide();

      //refresh bitcoin balance and txs
      this.$store.dispatch("bitcoin/getBalance");
      this.$store.dispatch("bitcoin/getTransactions");
    },
    onChannelClose() {
      //refresh channels, balance and txs
      this.fetchData();
      this.$refs["manage-channel-modal"].hide();

      //refresh bitcoin balance and txs
      this.$store.dispatch("bitcoin/getBalance");
      this.$store.dispatch("bitcoin/getTransactions");
    },
    fetchData() {
      this.$store.dispatch("system/getUnit");
      this.$store.dispatch("bitcoin/getSync");
      this.$store.dispatch("bitcoin/getBalance");
      this.$store.dispatch("bitcoin/getTransactions");
      this.$store.dispatch("lightning/getSync");
      this.$store.dispatch("lightning/getRecoveryInfo");
      this.$store.dispatch("lightning/getTransactions");
      this.$store.dispatch("lightning/getChannels");
      this.$store.dispatch("lightning/getLndPageData");
      this.$store.dispatch("system/getBackupStatus");
    }
  },
  created() {
    this.fetchData();

    //refresh this data every 20s:
    this.dataInterval = window.setInterval(this.fetchData, 10000);
    // show terms initially, then have modal take over logic
    this.$bvModal.show("onboarding-modal");
  },
  beforeDestroy() {
    window.clearInterval(this.dataInterval);
  },
  watch: {
    password: function() {
      this.isIncorrectPassword = false;
    }
  },
  components: {
    BitcoinWallet,
    LightningWallet,
    TotalBalance,
    CardWidget,
    Stat,
    ToggleSwitch,
    ChannelList,
    ChannelOpen,
    ChannelManage,
    LightningAddressModal,
    SecretWordsModal,
    ConnectWalletModal,
    OnboardingModal,
    RecoveryChannels
  }
};
</script>

<style lang="scss" scoped>
.app-icon {
  height: 120px;
  width: 120px;
  border-radius: 22%;
}
</style>
