<template>
  <b-modal id="node-id-modal" size="lg" centered hide-footer>
    <template v-slot:modal-header="{ close }">
      <div class="px-2 px-sm-3 pt-2 d-flex justify-content-between w-100">
        <h3 class="m-0">Node ID</h3>
        <!-- Emulate built in modal header close button action -->
        <a href="#" class="align-self-center" v-on:click.stop.prevent="close">
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
    <div class="px-2 px-sm-3 pb-2 pb-sm-3">
      <p>
        Other Lightning nodes can open payment channels to your node using the
        following Node ID
      </p>
      <div class="d-flex flex-column flex-md-row align-items-center">
        <!-- Pubkey QR Code -->
        <qr-code
          v-if="nodeIdValue"
          :value="nodeIdValue"
          :size="180"
          class="qr-image mx-auto mb-4 mb-md-0"
          showLogo
        ></qr-code>
        <span
          v-else
          class="loading-placeholder mx-auto mb-4 mb-md-0"
          style="width: 180px; height: 180px;"
        ></span>
        <div class="w-100 align-self-center ml-0 ml-md-4">
          <label class="mb-1 d-block"
            ><small class="font-weight-bold">Network</small></label
          >
          <b-form-select
            v-if="uriOptions.length"
            class="mb-2"
            v-model="chosenUri"
            :options="uriOptions"
          ></b-form-select>
          <div v-else-if="pubkey" class="text-muted mb-2 py-2">
            No network address advertised
          </div>
          <span
            class="loading-placeholder loading-placeholder-lg mt-1"
            style="width: 100%;"
            v-else
          ></span>
          <label class="mb-1 d-block"
            ><small class="font-weight-bold">Node ID</small></label
          >
          <div v-if="nodeIdValue">
            <input-copy
              class="mb-2"
              size="sm"
              :value="nodeIdValue"
            ></input-copy>
          </div>
          <span
            class="loading-placeholder loading-placeholder-lg mt-1"
            style="width: 100%;"
            v-else
          ></span>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";
import InputCopy from "@/components/Utility/InputCopy";
import QrCode from "@/components/Utility/QrCode";

export default {
  data() {
    return {
      chosenUri: ""
    };
  },
  computed: {
    ...mapState({
      uris: state => state.lightning.uris,
      pubkey: state => state.lightning.pubkey
    }),
    uriOptions() {
      return (Array.isArray(this.uris) ? this.uris : []).map(uri =>
        this.getUriOption(uri)
      );
    },
    nodeIdValue() {
      return this.chosenUri || this.pubkey;
    }
  },
  watch: {
    uriOptions: {
      handler(options) {
        if (!options.length) {
          this.chosenUri = "";
          return;
        }

        if (!options.some(option => option.value === this.chosenUri)) {
          this.chosenUri = options[0].value;
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    getUriOption(uri) {
      if (uri.includes("onion")) {
        return { value: uri, text: "Tor" };
      }

      const host = uri.split("@")[1] || uri;

      return { value: uri, text: `Clearnet (${host.replace(/:9735$/, "")})` };
    }
  },
  components: {
    InputCopy,
    QrCode
  }
};
</script>
