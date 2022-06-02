<template>
  <b-modal id="connect-wallet-modal" size="xl" centered hide-footer>
    <template v-slot:modal-header="{ close }">
      <div class="px-2 px-sm-3 pt-2 d-flex justify-content-between w-100">
        <h3 class="text-lowercase">Connect your Lightning wallet to your node</h3>
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
              :value="
                currentMode === 'rest'
                  ? restTor.lndconnectUrl
                  : grpcTor.lndconnectUrl
              "
              :size="240"
              class="qr-image mx-auto"
              showLogo
            ></qr-code>
          </div>
          <div class="col-12 col-lg-8 align-items-center">
            <!-- BUTTONS -->
            <div
              class="d-flex d-lg-inline-block w-100"
              role="group"
              aria-label="Basic example"
            >
              <div
                class="col-12 col-lg-8 px-0 btn-group border border-primary rounded mb-2"
              >
                <b-button
                  v-for="mode in modes"
                  :key="mode"
                  class="btn btn-block mt-0"
                  :class="{
                    [`bg-primary text-white`]: currentMode === mode,
                    [`btn-light text-primary`]: currentMode !== mode
                  }"
                  @click="currentMode = mode"
                >
                  {{ mode }}
                </b-button>
              </div>
            </div>
            <!-- REST Section -->
            <div v-if="currentMode === 'rest'">
              <div class="row">
                <div class="col-12 col-sm-6">
                  <label class="mb-1 d-block"
                    ><small class="ml-1 font-weight-bold">Host</small></label
                  >
                  <div v-if="restTor.host">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="
                        restTor.host.substring(0, restTor.host.indexOf(':'))
                      "
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
                    ><small class="ml-1 font-weight-bold">Port</small></label
                  >
                  <div v-if="restTor.host">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="
                        restTor.host.substring(restTor.host.indexOf(':') + 1)
                      "
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
                    ><small class="ml-1 font-weight-bold"
                      >Macaroon</small
                    ></label
                  >
                  <div v-if="restTor.macaroon">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="restTor.macaroon"
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
                    ><small class="ml-1 font-weight-bold"
                      >lndconnect URL</small
                    ></label
                  >
                  <div v-if="restTor">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="restTor.lndconnectUrl"
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
            <!-- GRPC Section -->
            <div v-if="currentMode === 'grpc'">
              <div class="row">
                <div class="col-12 col-sm-6">
                  <label class="mb-1 d-block"
                    ><small class="ml-1 font-weight-bold">Host</small></label
                  >
                  <div v-if="grpcTor.host">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="
                        grpcTor.host.substring(0, grpcTor.host.indexOf(':'))
                      "
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
                    ><small class="ml-1 font-weight-bold">Port</small></label
                  >
                  <div v-if="grpcTor.host">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="
                        grpcTor.host.substring(grpcTor.host.indexOf(':') + 1)
                      "
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
                    ><small class="ml-1 font-weight-bold"
                      >Macaroon</small
                    ></label
                  >
                  <div v-if="grpcTor.macaroon">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="grpcTor.macaroon"
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
                    ><small class="ml-1 font-weight-bold"
                      >lndconnect URL</small
                    ></label
                  >
                  <div v-if="grpcTor">
                    <input-copy
                      class="mb-2"
                      size="sm"
                      :value="grpcTor.lndconnectUrl"
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
              <a target="_blank" href="#">Click here</a>
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
      currentMode: "rest",
      modes: ["rest", "grpc"]
    };
  },
  computed: {
    ...mapState({
      grpcLocal: state => {
        if (state.lightning.lndConnectUrls.grpcLocal) {
          return {
            ...decode(state.lightning.lndConnectUrls.grpcLocal),
            lndconnectUrl: state.lightning.lndConnectUrls.grpcLocal
          };
        }
      },
      grpcTor: state => {
        if (state.lightning.lndConnectUrls.grpcTor) {
          return {
            ...decode(state.lightning.lndConnectUrls.grpcTor),
            lndconnectUrl: state.lightning.lndConnectUrls.grpcTor
          };
        }
      },
      restLocal: state => {
        if (state.lightning.lndConnectUrls.restLocal) {
          return {
            ...decode(state.lightning.lndConnectUrls.restLocal),
            lndconnectUrl: state.lightning.lndConnectUrls.restLocal
          };
        }
      },
      restTor: state => {
        if (state.lightning.lndConnectUrls.restTor) {
          return {
            ...decode(state.lightning.lndConnectUrls.restTor),
            lndconnectUrl: state.lightning.lndConnectUrls.restTor
          };
        }
      }
    })
  },
  components: {
    QrCode,
    InputCopy
  }
};
</script>
