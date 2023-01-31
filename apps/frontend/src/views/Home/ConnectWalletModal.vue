<template>
  <b-modal id="connect-wallet-modal" size="lg" centered hide-footer>
    <template v-slot:modal-header="{ close }">
      <div class="px-2 px-sm-3 pt-2 d-flex justify-content-between w-100">
        <h3>Connect a wallet to your node</h3>
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
    <div
      class="pt-2 px-3 d-flex flex-column justify-content-between w-100 mt-n4"
    >
      <div class="pb-2 pb-sm-3 mt-3">
        <div class="row flex-column-reverse flex-lg-row">
          <div class="col-12 col-lg-4 px-0 mt-4 mt-lg-0">
            <!-- QR Code -->
            <qr-code
              v-if="lndconnectUrl"
              :value="lndconnectUrl"
              :size="240"
              class="qr-image mx-auto"
              showLogo
            ></qr-code>
          </div>
          <div class="col-12 col-lg-8 align-items-center">
            <label class="mb-1 d-block"
              ><small class="font-weight-bold">Choose mode and network</small></label
            >
            <b-form-select class="mb-2" v-model="chosenMode" :options="modes"></b-form-select>

            <div>
              <div class="row">

                <div class="col-12 col-sm-6">
                  <label class="mb-1 d-block"
                    ><small class="font-weight-bold">Host</small></label
                  >
                  <div v-if="host">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="host"
                    ></input-copy>
                  </div>
                  <span
                    class="loading-placeholder loading-placeholder-lg mt-1"
                    style="width: 100%;"
                    v-else
                  ></span>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="mb-1 d-block"
                    ><small class="font-weight-bold">Port</small></label
                  >
                  <div v-if="port">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="port"
                    ></input-copy>
                  </div>
                  <span
                    class="loading-placeholder loading-placeholder-lg mt-1"
                    style="width: 100%;"
                    v-else
                  ></span>
                </div>
                <div class="col-12 col-sm-6">
                  <label class="mb-1 d-block"
                    ><small class="font-weight-bold"
                      >Macaroon</small
                    ></label
                  >
                  <div v-if="macaroon">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="macaroon"
                    ></input-copy>
                  </div>
                  <span
                    class="loading-placeholder loading-placeholder-lg mt-1"
                    style="width: 100%;"
                    v-else
                  ></span>
                </div>
                <div class="col-12 col-sm-6">
                  <label class="mb-1 d-block"
                    ><small class="font-weight-bold"
                      >lndconnect URL</small
                    ></label
                  >
                  <div v-if="lndconnectUrl">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="lndconnectUrl"
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
            <p class="mt-2 mb-4">
              Looking for step-by-step instructions to connect your Lightning
              wallet to your node?
              <a href="https://link.umbrel.com/connect-lightning" target="_blank">Click here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";
import QrCode from "@/components/Utility/QrCode";
import InputCopy from "@/components/Utility/InputCopy";
import { decode } from "lndconnect";

export default {
  data() {
    return {
      chosenMode: "restTor",
      modes: [
        { value: "restTor", text: "REST (Tor)" },
        { value: "restLocal", text: "REST (Local Network)"},
        { value: "grpcTor", text: "gRPC (Tor)" },
        { value: "grpcLocal", text: "gRPC (Local Network)" }
      ],
    };
  },
  computed: {
    ...mapState({
      lndConnectUrls: state => state.lightning.lndConnectUrls
    }),
    lndconnectUrl() {
      return this.lndConnectUrls.restLocal ? this.lndConnectUrls[this.chosenMode] : "";
    },
    host() {
      return this.lndConnectUrls.restLocal ? decode(this.lndConnectUrls[this.chosenMode]).host.split(":")[0] : "";
    },
    port() {
      return this.lndConnectUrls.restLocal ? decode(this.lndConnectUrls[this.chosenMode]).host.split(":")[1] : "";
    },
    macaroon() {
      return this.lndConnectUrls.restLocal ? decode(this.lndConnectUrls[this.chosenMode]).macaroon : "";
    },
  },
  components: {
    QrCode,
    InputCopy
  }
};
</script>
