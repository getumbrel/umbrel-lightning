<template>
  <b-modal
    id="advanced-settings-modal"
    body-class="advanced-settings-modal-body"
    size="lg"
    centered
    hide-footer
    scrollable
    :no-close-on-esc="disableModalClose"
    :no-close-on-backdrop="disableModalClose"
    @show="resetModal"
    @hidden="clearWatchTowerIntervals"
    @hide="checkForUnsavedChanges"
  >
    <template v-slot:modal-header="{ close }">
      <div class="px-sm-3 pt-2 d-flex justify-content-between w-100">
        <h3 class="pt-1 mb-0">Advanced Settings</h3>
        <!-- Emulate built in modal header close button action -->
        <a href="#" class="align-self-center" :class="{'d-none': disableModalClose}" v-on:click.stop.prevent="close">
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
    <b-form @submit.prevent="saveAndRestartLnd(false)" @keydown.enter.prevent>
      <div
        class="px-0 px-sm-3 pb-3 d-flex flex-column justify-content-between w-100"
      >
        <b-alert variant="warning" show class="mb-3 d-flex align-items-center">
          <b-icon class="d-block mr-2" icon="exclamation-triangle-fill"></b-icon>
          <small class="d-block">
            Use caution when changing these settings, as they may have unexpected results.
          </small>
        </b-alert>

        <b-overlay class="disabled-overlay" :show="isSettingsDisabled" rounded="sm">

          <!-- PERSONALIZATION SETTINGS -->
          <b-card no-body class="setting-group-container mb-2">
            <b-card-header v-b-toggle.personalization-settings header-tag="header" class="setting-group-header px-2 px-sm-3 d-flex justify-content-between align-items-center" role="tab">
              <div :class="{'fade-in-out': !hasLoadedSettings}">
                <p class="setting-group-title mb-1 font-weight-bold">Personalization</p>
                <small class="d-block text-muted">
                  Give your node a name and color.
                </small>
              </div>
              <b-icon class="when-closed ml-2 text-muted" icon="plus" variant="secondary"></b-icon><b-icon class="when-open ml-2 text-muted" icon="dash" variant="secondary"></b-icon>
            </b-card-header>
            <b-collapse v-if="hasLoadedSettings" class="setting-group-body bg-light" id="personalization-settings" accordion="personalization-settings" role="tabpanel">

              <!-- ALIAS -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="alias">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Node Name
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            alias
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-form-input
                        class="advanced-settings-input"
                        id="alias"
                        type="text"
                        autocomplete="off"
                        v-model="aliasInput"
                      ></b-form-input>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set an an easily recoginizable name for your node, to helps 
                    others easily identify it when they make payments or open 
                    channels.
                  </small>
                </div>
              </b-card-body>

              <!-- COLOR -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <p class="subsetting-title font-weight-bold mb-0 mr-1">
                        Node Color
                        <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                          color
                        </span>
                      </p>
                    </div>
                    <div class="input-container ml-1">
                      <lv-colorpicker
                        v-model="settings['color']"
                        hidePalette
                      />
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set a color for your node to easily identify it in network explorer or 
                    visualization tools.
                  </small>
                </div>
              </b-card-body>
            </b-collapse>
          </b-card>

          <!-- TOR & CLEARNET SETTINGS -->
          <b-card no-body class="setting-group-container mb-2">
            <b-card-header v-b-toggle.tor-clearnet-settings header-tag="header" class="setting-group-header px-2 px-sm-3 d-flex justify-content-between align-items-center" role="tab">
              <div :class="{'fade-in-out': !hasLoadedSettings}">
                <p class="setting-group-title mb-1 font-weight-bold">Tor & Clearnet</p>
                <small class="d-block text-muted">
                  Configure your node to be Tor-only or hybrid.
                </small>
              </div>
              <b-icon class="when-closed ml-2 text-muted" icon="plus" variant="secondary"></b-icon><b-icon class="when-open ml-2 text-muted" icon="dash" variant="secondary"></b-icon>
            </b-card-header>
            <b-collapse v-if="hasLoadedSettings" class="setting-group-body bg-light" id="tor-clearnet-settings" accordion="tor-clearnet-settings" role="tabpanel">

              <!-- tor.skip-proxy-for-clearnet-targets -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="tor-skip-proxy">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Hybrid Mode
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            tor.skip-proxy-for-clearnet-targets
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                        id="tor-skip-proxy"
                        class="align-self-center"
                        :on="settings['tor.skip-proxy-for-clearnet-targets']"
                        @toggle="status => (settings['tor.skip-proxy-for-clearnet-targets'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    <p>
                      Hybrid Mode enables your node to connect with clearnet peers through clearnet and peers running behind Tor (that are not broadcasting their clearnet IP address) via Tor,
                      enhancing both latency and connection stability.
                    </p>
                    <p class="mb-0">
                      Note: To enable incoming clearnet connections, you may need to forward port 9735 on your router. For greater privacy, you can disable Hybrid Mode;
                      however, this may decrease reliability.
                    </p>
                  </small>
                </div>
              </b-card-body>

              <!-- TOR STREAM ISOLATION -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="stream-isolation">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Separate Tor Connections
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            tor.streamisolation
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="stream-isolation"
                      class="align-self-center"
                      :on="settings['tor.streamisolation']"
                      @toggle="status => (settings['tor.streamisolation'] = status)"
                      :disabled="isTorStreamIsolationDisabled"
                      :tooltip="torStreamIsolationTooltip"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    <p>
                      Increase privacy by requiring Tor to use a new circuit for each connection. This can make it more difficult to correlate connections but may impact performance,
                      particularly if you have a large number of payment channels.
                    </p>
                    <p class="mb-0">
                      Note: This feature cannot be used if 'Hybrid Mode' is also enabled, as direct clearnet connections need to share public IP addresses.
                    </p>
                  </small>
                </div>
              </b-card-body>

            </b-collapse>
          </b-card>

          <!-- CHANNELS SETTINGS -->
          <b-card no-body class="setting-group-container mb-2">
            <b-card-header v-b-toggle.channels-settings header-tag="header" class="setting-group-header px-2 px-sm-3 d-flex justify-content-between align-items-center" role="tab">
              <div :class="{'fade-in-out': !hasLoadedSettings}">
                <p class="setting-group-title mb-1 font-weight-bold">Channels</p>
                <small class="d-block text-muted">
                  Enable larger channels, limit channel sizes, set commit fees, and more.
                </small>
              </div>
              <b-icon class="when-closed ml-2 text-muted" icon="plus" variant="secondary"></b-icon><b-icon class="when-open ml-2 text-muted" icon="dash" variant="secondary"></b-icon>
            </b-card-header>
            <b-collapse v-if="hasLoadedSettings" class="setting-group-body bg-light" id="channels-settings" accordion="channels-settings" role="tabpanel">

              <!-- DEFAULT CHANNEL CONFIRMATIONS-->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="defaultchanconfs">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Confirmations for Channel Open
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            bitcoin.defaultchanconfs
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group :append="`${Number(settings['bitcoin.defaultchanconfs']) === 1 ? 'block' : 'blocks'}`">
                        <b-form-input
                        class="advanced-settings-input"
                        id="defaultchanconfs"
                        type="number"
                        v-model="settings['bitcoin.defaultchanconfs']"
                        number
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the number of confirmations on the blockchain that are required for 
                    a channel to be considered open.
                  </small>
                </div>
              </b-card-body>

              <!-- WUMBO CHANNELS-->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="wumbo-channels">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Larger Channels
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            protocol.wumbo-channels
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="wumbo-channels"
                      class="align-self-center"
                      :on="settings['protocol.wumbo-channels']"
                      @toggle="status => (settings['protocol.wumbo-channels'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Allow creating and accepting channels with a larger capacity 
                    (up to 10 BTC) than the default limit of 0.16 BTC.
                  </small>
                </div>
              </b-card-body>

              <!-- MIN CHANNEL SIZE -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="min-chan-size">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Minimum Channel Size
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            minchansize
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group append="sats">
                        <b-form-input
                        class="advanced-settings-input"
                        id="min-chan-size"
                        type="number"
                        v-model="settings['minchansize']"
                        number
                        autocomplete="off"
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the smallest channel size your node will accept. Channels smaller than 
                    this will be rejected. This can prevent opening channels that are too small to 
                    be useful and too costly to close.
                  </small>
                </div>
              </b-card-body>

              <!-- MAX CHANNEL SIZE -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="max-chan-size">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Maximum Channel Size
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            maxchansize
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group append="sats">
                        <b-form-input
                        class="advanced-settings-input"
                        id="max-chan-size"
                        type="number"
                        v-model="settings['maxchansize']"
                        number
                        autocomplete="off"
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the largest channel size your node will accept. Channels larger than this 
                    will be rejected.
                  </small>
                </div>
              </b-card-body>

              <!-- MAX PENDING CHANNELS -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="max-pending-channels">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Maximum Pending Channels per Peer
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            maxpendingchannels
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-form-input
                      class="advanced-settings-input"
                      id="max-pending-channels"
                      type="number"
                      v-model="settings['maxpendingchannels']"
                      number
                      autocomplete="off"
                      ></b-form-input>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set a limit on the number of incoming channels that can be pending per peer.
                  </small>
                </div>
              </b-card-body>

              <!-- COOP CLOSE TARGET CONFS -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="coop-close-target-confs">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Confirmations for Channel Close
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            coop-close-target-confs
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group :append="`${Number(settings['coop-close-target-confs']) === 1 ? 'block' : 'blocks'}`">
                        <b-form-input
                        class="advanced-settings-input"
                        id="coop-close-target-confs"
                        type="number"
                        v-model="settings['coop-close-target-confs']"
                        number
                        autocomplete="off"
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the number of blocks that the initiator of a cooperative channel close 
                    expects the transaction to confirm in. This is also used to estimate the 
                    starting fee rate for negotiation with the peer. For example, if set to 6, the 
                    initiator expects the transaction to confirm in 6 blocks.
                  </small>
                </div>
              </b-card-body>

              <!-- PAYMENTS EXPIRATION GRACE PERIOD -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="paymentsgraceperiod">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Payments Expiration Grace Period
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            payments-expiration-grace-period
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1 input-time">
                      <b-input-group>
                        <b-form-input
                        class="advanced-settings-input"
                        id="paymentsgraceperiod"
                        type="number"
                        number
                        v-model="paymentsExpirationGracePeriod.value"
                        autocomplete="off"
                        ></b-form-input>
                        <template #append>
                          <b-form-select v-model="paymentsExpirationGracePeriod.unit" :options="timeOptions"></b-form-select>
                        </template>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Add extra time, in addition to the current block-based deadline, before closing 
                    a channel with outgoing HTLCs that have timed out. This gives the receiver more time to claim 
                    the payment.
                  </small>
                </div>
              </b-card-body>

              <!-- MAX COMMIT FEE RATE ANCHORS -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="max-commit-fee-rate-anchors">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Maximum Anchor Channel Commit Fee Rate
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            max-commit-fee-rate-anchors
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group append="sat/vB">
                        <b-form-input
                        class="advanced-settings-input"
                        id="max-commit-fee-rate-anchors"
                        type="number"
                        v-model="settings['max-commit-fee-rate-anchors']"
                        number
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the maximum fee rate for commitments of anchor channels. A high enough 
                    value can ensure that the transaction is confirmed quickly on the blockchain.
                  </small>
                </div>
              </b-card-body>

            </b-collapse>
          </b-card>

          <!-- ROUTING SETTINGS  -->
          <b-card no-body class="setting-group-container mb-2">
            <b-card-header v-b-toggle.routing-settings header-tag="header" class="setting-group-header px-2 px-sm-3 d-flex justify-content-between align-items-center" role="tab">
              <div :class="{'fade-in-out': !hasLoadedSettings}">
                <p class="setting-group-title mb-1 font-weight-bold">Routing</p>
                <small class="d-block text-muted">
                  Set your routing fees, tweak routing success probabilities, and more.
                </small>
              </div>
              <b-icon class="when-closed ml-2 text-muted" icon="plus" variant="secondary"></b-icon><b-icon class="when-open ml-2 text-muted" icon="dash" variant="secondary"></b-icon>
            </b-card-header>
            <b-collapse v-if="hasLoadedSettings" class="setting-group-body bg-light" id="routing-settings" accordion="routing-settings" role="tabpanel">

              <!-- BASE FEE -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="base-fee">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Base Forwarding Fee
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            bitcoin.basefee
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group append="msats">
                        <b-form-input
                        class="advanced-settings-input"
                        id="base-fee"
                        type="number"
                        v-model="settings['bitcoin.basefee']"
                        number
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the base fee that your node will charge for forwarding payments through 
                    your channels. 1,000 msats = 1 sat.
                  </small>
                </div>
              </b-card-body>

              <!-- FEE RATE -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="fee-rate">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Forwarding Fee Rate
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            bitcoin.feerate
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group append="ppm">
                        <b-form-input
                        class="advanced-settings-input"
                        id="fee-rate"
                        type="number"
                        v-model="settings['bitcoin.feerate']"
                        number
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the fee rate in ppm (parts per million) charged by your node when 
                    forwarding payments through your channels. The total fee charged by your node 
                    (in sats) is base fee + (forwarded amount * fee rate / 1000000).
                  </small>
                </div>
              </b-card-body>

              <!-- KEYSEND -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="accept-keysend">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Receive Keysend Payments
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            accept-keysend
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="accept-keysend"
                      class="align-self-center"
                      :on="settings['accept-keysend']"
                      @toggle="status => (settings['accept-keysend'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Allow your node to receive payments sent spontaneously via keysend, meaning that others can send payments directly to your node without an invoice.
                    You will only receive payments if you have at least one public channel open.
                  </small>
                </div>
              </b-card-body>

              <!-- AMP -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="accept-amp">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Automatic Multipath Payments (AMP)
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            accept-amp
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="accept-amp"
                      class="align-self-center"
                      :on="settings['accept-amp']"
                      @toggle="status => (settings['accept-amp'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Allow payments made via AMP, which splits a payment into multiple
                    smaller payments sent through different routes to increase the chances
                    of success.
                  </small>
                </div>
              </b-card-body>

              <!-- ALLOW CIRCULAR ROUTE -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="allow-circular-route">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Circular Payment Routes
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            allow-circular-route
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="allow-circular-route"
                      class="align-self-center"
                      :on="settings['allow-circular-route']"
                      @toggle="status => (settings['allow-circular-route'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Allow payments that are sent through a circular route, where the payment arrives 
                    and departs at the same channel.
                  </small>
                </div>
              </b-card-body>

              <!-- MAXIMUM CLTV EXPIRY -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="max-cltv-expiry">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Maximum Payment Lock-up Time
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            max-cltv-expiry
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group :append="`${Number(settings['max-cltv-expiry']) === 1 ? 'block' : 'blocks'}`">
                        <b-form-input
                        class="advanced-settings-input"
                        id="max-cltv-expiry"
                        type="number"
                        v-model="settings['max-cltv-expiry']"
                        number
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the maximum number of blocks that funds can be locked up for when 
                    forwarding payments. This ensures that funds aren't locked up for too long. For 
                    example, if set to 2016, your node will not forward payments that have an 
                    expiry greater than 2016 blocks.
                  </small>
                </div>
              </b-card-body>

              <!-- TIMELOCK DELTA -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="fee-rate">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Timelock Delta
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            bitcoin.timelockdelta
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group :append="`${Number(settings['bitcoin.timelockdelta']) === 1 ? 'block' : 'blocks'}`">
                        <b-form-input
                        class="advanced-settings-input"
                        id="fee-rate"
                        type="number"
                        v-model="settings['bitcoin.timelockdelta']"
                        number
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the number of blocks subtracted from the expiry block
                    height when forwarding an HTLC. This can be used to reduce the
                    time that funds are locked up, but it may also increase the
                    risk of the payment expiring before it can be claimed.
                  </small>
                </div>
              </b-card-body>

              <!-- MIN SUCCESS PROB -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="minrtprob">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Minimum Route Success Probability
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            routerrpc.minrtprob
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-form-input
                      class="advanced-settings-input"
                      id="minrtprob"
                      type="number"
                      v-model="settings['routerrpc.minrtprob']"
                      number
                      step="any"
                      ></b-form-input>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the minimum required route success probability for your
                    node to attempt a payment (from 0 to 1). Your node will
                    only attempt to send a payment if the route success
                    probability is higher or equal to this value. This can reduce
                    the risk of a payment failing, but it also increases the
                    chances of a payment not being sent because no routes are
                    available with a high enough success probability.
                  </small>
                </div>
              </b-card-body>

              <!-- APRIORI HOP PROB -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="apriorihopprob">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Default Hop Success Probability
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            routerrpc.apriorihopprob
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-form-input
                      class="advanced-settings-input"
                      id="apriorihopprob"
                      type="number"
                      v-model="settings['routerrpc.apriorihopprob']"
                      number
                      step="any"
                      ></b-form-input>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the default success probability (from 0 to 1) of a hop in 
                    a route when no other information is available. Your node will 
                    use this value as the success probability of a hop (each hop 
                    in the route represents a channel that the payment goes through) 
                    when it doesn't have any other information about the channel.
                  </small>
                </div>
              </b-card-body>

              <!-- APRIORI PROB WEIGHT -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="aprioriweight">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Default Probability Weight
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            routerrpc.aprioriweight
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-form-input
                      class="advanced-settings-input"
                      id="aprioriweight"
                      type="number"
                      v-model="settings['routerrpc.aprioriweight']"
                      number
                      step="any"
                      ></b-form-input>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the weight (from 0 to 1) of the default hop success 
                    probability in the total probability estimation. It represents 
                    the importance of the default probability compared to the 
                    historical data of the channel. A value of 1 would give the 
                    default probability full weight and a value of 0 would give 
                    the historical data full weight. For example, if the assumed 
                    probability is set to 0.3, and the historical data of the 
                    channel estimates a probability of 0.4, the final success 
                    probability would be 0.3*0.2 + (1-0.3)*0.4 = 0.34.
                  </small>
                </div>
              </b-card-body>

              <!-- PENALTY HALF-LIFE -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="penaltyhalflife">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Penalty Half-life
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            routerrpc.penaltyhalflife
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1 input-time">
                      <b-input-group>
                        <b-form-input
                        class="advanced-settings-input"
                        id="penaltyhalflife"
                        type="number"
                        number
                        v-model="penaltyHalflife.value"
                        autocomplete="off"
                        ></b-form-input>
                        <template #append>
                          <b-form-select v-model="penaltyHalflife.unit" :options="timeOptions"></b-form-select>
                        </template>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the duration after which a penalized node or channel's
                    success probability is back to 50%. For example, 
                    if set to 2 hours, and a node or channel is penalized for 
                    a failed payment, after 2 hours its success probability 
                    will be back to 50%.
                  </small>
                </div>
              </b-card-body>

              <!-- FAILED ATTEMPT COST -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="attemptcost">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Failed Payment Cost
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            routerrpc.attemptcost
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group append="sats">
                        <b-form-input
                        class="advanced-settings-input"
                        id="attemptcost"
                        type="number"
                        v-model="settings['routerrpc.attemptcost']"
                        number
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the fixed cost of a failed payment attempt. This is a
                    virtual value that does not represent an actual transfer of
                    funds and is used to discourage frequent payment attempts to
                    avoid load on the Lightning Network.
                  </small>
                </div>
              </b-card-body>

              <!-- PROPORTIONAL FAILED ATTEMPT COST -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="attemptcostppm">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Proportional Failed Payment Cost
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            routerrpc.attemptcostppm
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group append="ppm">
                        <b-form-input
                        class="advanced-settings-input"
                        id="attemptcostppm"
                        type="number"
                        v-model="settings['routerrpc.attemptcostppm']"
                        number
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the proportional cost in parts per million (ppm) of 
                    the total amount of a failed payment attempt. This will  
                    be incurred as a proportion of the total amount of a 
                    failed payment. It is a virtual value and does 
                    not represent an actual transfer of funds.
                  </small>
                </div>
              </b-card-body>

            </b-collapse>
          </b-card>

          <!-- WATCHTOWER SETTINGS -->
          <b-card no-body class="setting-group-container mb-2">
            <b-card-header v-b-toggle.watchtower-settings header-tag="header" class="setting-group-header px-2 px-sm-3 d-flex justify-content-between align-items-center" role="tab">
              <div :class="{'fade-in-out': !hasLoadedSettings}">
                <p class="setting-group-title mb-1 font-weight-bold">Watchtower</p>
                <small class="d-block text-muted">
                  Run a watchtower service to help others, and add external services to guard your channels.
                </small>
              </div>
              <b-icon class="when-closed ml-2 text-muted" icon="plus" variant="secondary"></b-icon><b-icon class="when-open ml-2 text-muted" icon="dash" variant="secondary"></b-icon>
            </b-card-header>
            <b-collapse v-if="hasLoadedSettings" class="setting-group-body bg-light" id="watchtower-settings" accordion="watchtower-settings" role="tabpanel">

              <!-- WATCHTOWER SERVICE -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="watchtower-active">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Watchtower Service
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            watchtower.active
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="watchtower-active"
                      class="align-self-center"
                      :on="settings['watchtower.active']"
                      @toggle="status => (settings['watchtower.active'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Run a watchtower to help other nodes. A watchtower service
                    monitors channels of other nodes for breaches and, in the event 
                    of a breach, sends a complaint transaction to the blockchain 
                    to claim back the locked funds.
                    <br/>
                    If enabled, you will see your watchtower's URI below. This URI
                    can then be shared with other nodes to allow them to add your
                    watchtower service to their watchtower client.
                  </small>
                  <!-- if the setting is enabled locally in the UI -->
                  <div v-if="settings['watchtower.active']" class="mt-2">
                    <!-- if the setting is not yet saved -->
                    <div v-if="!lndConfig['watchtower.active']">
                      <input-copy class="bg-white" size="sm" value="Your watchtower service URI will appear here after you save and restart"></input-copy>
                    </div>
                    <!-- if the setting's saved and the URI has been fetched -->
                    <div v-else-if="watchtowerServiceUri">
                      <input-copy class="bg-white" size="sm" :value="watchtowerServiceUri"></input-copy>
                    </div>
                    <!-- if the setting's saved but the URI hasn't been fetched yet -->
                    <span
                      v-else
                      class="loading-placeholder loading-placeholder-lg mt-1"
                      style="width: 100%;"
                    ></span>
                  </div>
                </div>
              </b-card-body>

              <!-- WATCHTOWER CLIENT -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="wtclient-active">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Watchtower Client
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            wtclient.active
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="wtclient-active"
                      class="align-self-center"
                      :on="settings['wtclient.active']"
                      @toggle="status => (settings['wtclient.active'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Connect to external watchtower services to protect your
                    channels. If enabled, you can add external watchtower services
                    to which your node will send surveillance information of its 
                    channels so the watchtowers can monitor them and take action in 
                    case of a breach.
                  </small>

                  <!-- if the setting is enabled locally in the UI -->
                  <div v-if="settings['wtclient.active']" class="mt-2">
                    <!-- if the setting isn't saved yet, show a tooltip and disable the input/button -->
                    <b-input-group v-b-tooltip.hover.bottom :title="!lndConfig['wtclient.active'] ? 'Save and restart your node to add a watchtower' : ''" class="">
                      <b-form-input class="advanced-settings-input" v-model="addWatchtowerInput" autocomplete="off" placeholder="Enter a watchtower URI as pubkey@host:port" :disabled="!lndConfig['wtclient.active']"></b-form-input>
                      <b-input-group-append>
                        <b-button class="add-btn" variant="success" @click.prevent="addWatchtower(addWatchtowerInput)" :disabled="!lndConfig['wtclient.active']">Add</b-button>
                      </b-input-group-append>
                    </b-input-group>

                    <b-alert variant="danger" :show="showAddWatchtowerError" class="mt-3" dismissible @dismissed="showAddWatchtowerError=false">
                      <small>
                        {{ addWatchtowerError }}
                      </small>
                    </b-alert>
                    <b-alert variant="success" :show="showAddWatchtowerSuccess" class="mt-3" dismissible @dismissed="showAddWatchtowerSuccess=false">
                      <small>
                        Watchtower added successfully.
                      </small>
                    </b-alert>

                    <div v-show="watchtowers.length" class="watchtower-list-container mt-3 p-3 bg-white">
                      <p class="watchtower-subtitle text-uppercase text-muted mb-0">Watchtowers</p>
                      <div v-for="watchtower in watchtowers" :key="watchtower.pubkey">      
                        <b-card no-body class="watchtower-container mt-2">
                          <b-card-header v-b-toggle="watchtower.pubkey" header-tag="header" class="watchtower-header px-2 py-1 d-flex justify-content-between align-items-center" role="tab">
                            <b-icon class="watchtower-icons when-closed" icon="chevron-right" variant="secondary"></b-icon><b-icon class="watchtower-icons when-open" icon="chevron-down" variant="secondary"></b-icon>
                            <b-form-input class="watchtower-info pl-1" plaintext :value="watchtower.pubkey"></b-form-input>
                            <b-icon class="watchtower-icons ml-2" icon="trash-fill" variant="secondary" @click.stop="removeWatchtower(watchtower.pubkey)"></b-icon>
                          </b-card-header>
                          <b-collapse class="watchtower-body bg-light pl-4 pr-2" :id="watchtower.pubkey" role="tabpanel">
                            <hr class="watchtower-divider-top" />
                            <p class="watchtower-subtitle mb-0 text-uppercase text-muted">Addresses</p>
                            <div v-for="address in watchtower.addresses" :key="address">
                              <div class="mt-2 d-flex justify-content-between align-items-center">
                                <b-form-input class="watchtower-info m-0 p-0" plaintext :value="address"></b-form-input>
                                <b-icon class="watchtower-icons ml-2" icon="backspace" variant="secondary" @click.stop="removeWatchtowerAddress(watchtower.pubkey, address)"></b-icon>
                              </div>
                            </div>
                            <hr class="watchtower-divider-bottom" />
                          </b-collapse>
                        </b-card>

                        <b-alert variant="danger" :show="removeWatchtowerError.status && removeWatchtowerError.watchtowerPubkey === watchtower.pubkey" class="mt-2 mb-0" dismissible @dismissed="resetRemoveWatchtowerError">
                          <small>{{removeWatchtowerError.message}}</small>
                        </b-alert>
                      </div>
                    </div>
                  </div>
                </div>
              </b-card-body>

              <!-- WATCHTOWER SWEEP FEE RATE -->
              <b-card-body v-show="settings['wtclient.active']" class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="sweep-fee-rate">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Watchtower Client Sweep Fee Rate
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            wtclient.sweep-fee-rate
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-input-group append="sat/vB">
                        <b-form-input
                        class="advanced-settings-input"
                        id="sweep-fee-rate"
                        type="number"
                        v-model="settings['wtclient.sweep-fee-rate']"
                        number
                        ></b-form-input>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the fee rate for justice transactions that are signed by
                    the watchtower client. This should be set as the maximum fee
                    rate you're willing to pay to sweep funds if a breach occurs
                    while being offline.
                  </small>
                </div>
              </b-card-body>
            </b-collapse>
          </b-card>

          <!-- OPTIMIZATION SETTINGS -->
          <b-card no-body class="setting-group-container mb-2">
            <b-card-header v-b-toggle.optimization-settings header-tag="header" class="setting-group-header px-2 px-sm-3 d-flex justify-content-between align-items-center" role="tab">
              <div :class="{'fade-in-out': !hasLoadedSettings}">
                <p class="setting-group-title mb-1 font-weight-bold">Optimization</p>
                <small class="d-block text-muted">
                  Fine-tune the performance and resource usage of your node.
                </small>
              </div>
              <b-icon class="when-closed ml-2 text-muted" icon="plus" variant="secondary"></b-icon><b-icon class="when-open ml-2 text-muted" icon="dash" variant="secondary"></b-icon>
            </b-card-header>
            <b-collapse v-if="hasLoadedSettings" class="setting-group-body bg-light" id="optimization-settings" accordion="optimization-settings" role="tabpanel">

              <!-- SYNC FREE LIST -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="sync-freelist">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Database Sync
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            sync-freelist
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="sync-freelist"
                      class="align-self-center"
                      :on="settings['sync-freelist']"
                      @toggle="status => (settings['sync-freelist'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Speed up your node's startup time by syncing the free list of the database. 
                    This may cause slower performance for large databases and use more 
                    memory.
                  </small>
                </div>
              </b-card-body>

              <!-- STAGGER INITIAL RECONNECT -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="stagger-initial-reconnect">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Delay Initial Reconnections
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            stagger-initial-reconnect
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="stagger-initial-reconnect"
                      class="align-self-center"
                      :on="settings['stagger-initial-reconnect']"
                      @toggle="status => (settings['stagger-initial-reconnect'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Apply a random delay of 0-30 seconds between reconnection attempts to 
                    persistent peers when your node starts up. This could be useful to decrease 
                    resource usage when starting up with many channels. The first 10 reconnections 
                    will be attempted instantly, regardless of this setting.
                  </small>
                </div>
              </b-card-body>

              <!-- MISSION CONTROL HISTORY -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="maxmchistory">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Maximum Mission Control History
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            routerrpc.maxmchistory
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-form-input
                      class="advanced-settings-input"
                      id="maxmchistory"
                      type="number"
                      v-model="settings['routerrpc.maxmchistory']"
                      number
                      ></b-form-input>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the maximum number of payment results stored 
                    by mission control, a feature that allows your 
                    node to optimize its routing strategy by 
                    analyzing its previous payment attempts. A lower 
                    value uses less storage, but may result in less accurate 
                    routing decisions.
                  </small>
                </div>
              </b-card-body>

              <!-- GARBAGE COLLECT STARTUP -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="gc-canceled-invoices-on-startup">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Delete Canceled Invoices on Startup
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            gc-canceled-invoices-on-startup
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="gc-canceled-invoices-on-startup"
                      class="align-self-center"
                      :on="settings['gc-canceled-invoices-on-startup']"
                      @toggle="status => (settings['gc-canceled-invoices-on-startup'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Delete all canceled invoices that are older than the expiry time every time 
                    your node starts up. This can help lower resource usage by freeing up resources 
                    used by canceled invoices.
                  </small>
                </div>
              </b-card-body>

              <!-- GARBAGE COLLECT ON FLY -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="gc-canceled-invoices-on-the-fly">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Delete Canceled Invoices in Real-time
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            gc-canceled-invoices-on-the-fly
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="gc-canceled-invoices-on-the-fly"
                      class="align-self-center"
                      :on="settings['gc-canceled-invoices-on-the-fly']"
                      @toggle="status => (settings['gc-canceled-invoices-on-the-fly'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Delete invoices immediately after they're canceled. This can help lower 
                    resource usage by deleting canceled invoices as they happen.
                  </small>
                </div>
              </b-card-body>

              <!-- MAX CHANNEL CACHE -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="channel-cache-size">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Maximum Channel Cache Entries
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            caches.channel-cache-size
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1">
                      <b-form-input
                      class="advanced-settings-input"
                      id="channel-cache-size"
                      type="number"
                      v-model="settings['caches.channel-cache-size']"
                      number
                      ></b-form-input>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set the maximum number of entries in the channel cache. 
                    Each entry requires roughly 2Kb. When your node receives 
                    gossip queries from other nodes, it will first check its 
                    channel cache to see if the information is already 
                    available, instead of allocating new memory to store the 
                    received information. A larger value results in less memory 
                    allocation from gossip queries, but also consumes more 
                    memory for the cache.
                  </small>
                </div>
              </b-card-body>

              <!-- AUTO COMPACT DATABASE-->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="bolt-auto-compact">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Automatic Database Compaction
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            db.bolt.auto-compact
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="bolt-auto-compact"
                      class="align-self-center"
                      :on="settings['db.bolt.auto-compact']"
                      @toggle="status => (settings['db.bolt.auto-compact'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Automatically compact the database used by your node every 
                    time it starts up. This database store various data used 
                    by your node, such as channel states and transaction history. 
                    Over time, it may become fragmented and take up more space 
                    than necessary. Compaction is a process that defragments it 
                    and reduces its size.
                    <br/>
                    
                    Your node may temporarily consume additional storage during 
                    compaction, and take a significant amount of time depending 
                    on the size of the database.
                  </small>
                </div>
              </b-card-body>

              <!-- MIN AGE FOR AUTO COMPACT -->
              <b-card-body v-show="settings['db.bolt.auto-compact']" class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="auto-compact-min-age">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Database Re-compaction Delay
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            db.bolt.auto-compact-min-age
                          </span>
                        </p>
                      </label>
                    </div>
                    <div class="input-container ml-1 input-time">
                      <b-input-group>
                        <b-form-input
                        class="advanced-settings-input"
                        id="auto-compact-min-age"
                        type="number"
                        number
                        v-model="autoCompactMinAge.value"
                        autocomplete="off"
                        ></b-form-input>
                        <template #append>
                          <b-form-select v-model="autoCompactMinAge.unit" :options="timeOptions"></b-form-select>
                        </template>
                      </b-input-group>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Set how long ago the last compaction of a database file 
                    must be for it to be considered for auto compaction again. 
                    This allows you to avoid unnecessary compaction, by 
                    configuring your node to only compact a database file if it 
                    has not been compacted recently. If you want to compact the 
                    database every time your node starts up, you can set this 
                    value to 0.
                  </small>
                </div>
              </b-card-body>

              <!--  STRICT GRAPH PRUNING -->
              <b-card-body class="subsetting-body px-2 px-sm-3">
                <div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-sm-grow-1">
                      <label class="mb-0" for="strictgraphpruning">
                        <p class="subsetting-title font-weight-bold mb-0 mr-1">
                          Strict Graph Pruning
                          <span class="subsetting-setting-lnd-name text-monospace font-weight-normal d-block">
                            routing.strictgraphpruning
                          </span>
                        </p>
                      </label>
                    </div>
                    <div>
                      <toggle-switch
                      id="strictgraphpruning"
                      class="align-self-center"
                      :on="settings['routing.strictgraphpruning']"
                      @toggle="status => (settings['routing.strictgraphpruning'] = status)"
                      ></toggle-switch>
                    </div>
                  </div>
                  <small class="w-lg-75 d-block text-muted mt-1">
                    Prune a channel even if a single edge is seen as stale. 
                    This can result in a more compact channel graph, and can 
                    also be helpful for neutrino nodes as they'll only 
                    maintain edges where both nodes are seen as being live 
                    from their point of view. 
                    <br/>
                    The channel graph is the network of channels that your node 
                    is aware of, and it is used to determine the possible routes 
                    for payments. Over time, it can become stale and contain 
                    outdated information. Graph pruning removes stale information 
                    from the channel graph to keep it up to date and improve 
                    routing efficiency.
                  </small>
                </div>
              </b-card-body>

            </b-collapse>
          </b-card>

          <!-- template overlay with empty div to show an overlay with no spinner -->
          <template #overlay>
            <div></div>
          </template>
        </b-overlay>

        <b-alert variant="danger" :show="showValidationErrors" class="error-message mt-3 mb-0" dismissible @dismissed="showValidationErrors=false">
          <p class="mb-0">Please fix the following errors and try again:</p>
          <ul class="mb-0 pl-3">
            <li v-for="error in validationErrors" :key="error">
              {{ error }}
            </li>
          </ul>
        </b-alert>

        <b-alert variant="danger" :show="showServerError" class="error-message mt-3 mb-0" dismissible @dismissed="showServerError=false">
          <p class="my-1">{{ serverError }}</p>
        </b-alert>

        <div v-if="showDelayRestartMessage" variant="info" class="error-message mt-3">
          <p class="mb-1">Shutting down Watchtower Client before restarting...</p>
          <b-progress
            :value="delayRestartProgress"
            class=""
            variant="secondary"
            :style="{ height: '5px' }"
          ></b-progress>
        </div>

        <div class="mt-3">
          <b-row>
            <b-col cols="12" lg="6">
              <b-button class="btn-border" variant="outline-secondary" block :disabled="isSettingsDisabled" @click="saveAndRestartLnd(true)">
                Restore Default Settings</b-button
              >
            </b-col>
            <b-col cols="12" lg="6">
              <b-button class="mt-2 mt-lg-0" variant="success" type="submit" block :disabled="isSettingsDisabled">
                Save and Restart Node</b-button
              >
            </b-col>
          </b-row>
        </div>
      </div>
    </b-form>
  </b-modal>
</template>

<script>
import API from "@/helpers/api";
import cloneDeep from "lodash.clonedeep";
import isEqual from "lodash.isequal";

import InputCopy from "@/components/Utility/InputCopy";
import LvColorpicker from 'lightvue/color-picker';
import ToggleSwitch from "@/components/Utility/ToggleSwitch.vue";
import { mapState } from "vuex";

export default {
  data() {
    return {
      // settings object keys are not in standard camelCase in order to maintain identical names between the umbrel-lnd.conf file and the json file.
      settings: {},
      aliasOnModalLoad: "",
      aliasInput: "",
      timeOptions: [
        { text: "sec", value: "s" },
        { text: "min", value: "m" },
        { text: "hr", value: "h" }
      ],
      paymentsExpirationGracePeriod: {
        unit: null,
        value: null
      },
      penaltyHalflife: {
        unit: null,
        value: null
      },
      autoCompactMinAge: {
        unit: null,
        value: null
      },
      isSettingsDisabled: false,
      validationErrors: [],
      showValidationErrors: false,
      serverError: "",
      showServerError: false,
      showDelayRestartMessage: false,
      delayRestartProgress: 0,
      addWatchtowerInput: "",
      showAddWatchtowerError: false,
      addWatchtowerError: "",
      removeWatchtowerError: {
        watchtowerPubkey: "",
        status: false,
        message: ""
      },
      showAddWatchtowerSuccess: false,
      disableModalClose: false
    };
  },
  computed: {
    ...mapState({
      lndConfig: state => state.user.lndConfig,
      watchtowerServiceUri: state => state.lightning.watchtowerServiceUri,
      watchtowers: state => state.lightning.watchtowers,
      alias: state => state.lightning.alias,
    }),
    hasLoadedSettings() {
      return Object.keys(this.settings).length > 0;
    },
    isTorStreamIsolationDisabled() {
      return this.settings['tor.skip-proxy-for-clearnet-targets'];
    },
    torStreamIsolationTooltip() {
      if (this.settings['tor.skip-proxy-for-clearnet-targets']) {
        return "This setting is automatically disabled when Hybrid Mode is enabled.";
      } else {
        return "";
      }
    }
  },
  watch: {
    isTorStreamIsolationDisabled(value) {
      if (!value) return;
      this.settings['tor.streamisolation'] = false;
    }
  },
  async created() {
    // fetch lnd config
    await this.$store.dispatch("user/getLndConfig");
    // then load up settings in the modal
    this.resetModal();
  },
  beforeDestroy() {
    this.clearWatchTowerIntervals();
  },
  components: {
    ToggleSwitch,
    LvColorpicker,
    InputCopy
  },
  methods: {
    resetModal() {
      this.setSettings();
      if (this.lndConfig['watchtower.active']) {
        this.fetchWatchtowerServiceUri();
        // interval to continuously fetch the watchtower service URI for case where lnd is restarting
        this.watchtowerServiceInterval = window.setInterval(this.fetchWatchtowerServiceUri, 10000);
      }
      if (this.lndConfig['wtclient.active']) {
        this.fetchListWatchtowers();
        // interval to continuously fetch the watchtower list for case where lnd is restarting
        this.listWatchtowersInterval = window.setInterval(this.fetchListWatchtowers, 10000);
      }
      // clear errors and watchtower input
      this.validationErrors = [];
      this.showValidationErrors = false;
      this.serverError = "";
      this.showServerError = false;
      this.addWatchtowerInput = "";
      this.showAddWatchtowerError = false;
      this.addWatchtowerError = "";
      this.removeWatchtowerError = {
        watchtowerPubkey: "",
        status: false,
        message: ""
      };
      this.showAddWatchtowerSuccess = false;
      this.disableModalClose = false;

    },
    async checkForUnsavedChanges(event) {
      this.setSpecialCaseSettings();
      if (!isEqual(this.settings, this.lndConfig)) {
        if (!window.confirm("You have unsaved settings. Do you want to continue without saving them and restarting your node?")) {
          event.preventDefault();
        }
      }
    },
    clearWatchTowerIntervals() {
      window.clearInterval(this.watchtowerServiceInterval);
      window.clearInterval(this.listWatchtowersInterval);
    },
    setSpecialCaseSettings() {
      // avoid setting alias in the JSON store to the default alias generated by LND. 
      // this prevents hardcoding the LND default alias.
      if (this.lndConfig['alias'] === "" && this.aliasInput === this.aliasOnModalLoad) {
       this.settings['alias'] = "";
      } else {
        this.settings['alias'] = this.aliasInput;
      }

      this.settings['payments-expiration-grace-period'] = `${this.paymentsExpirationGracePeriod.value}${this.paymentsExpirationGracePeriod.unit}`;
      this.settings['routerrpc.penaltyhalflife'] = `${this.penaltyHalflife.value}${this.penaltyHalflife.unit}`;
      this.settings['db.bolt.auto-compact-min-age'] = `${this.autoCompactMinAge.value}${this.autoCompactMinAge.unit}`;
    },
    async saveAndRestartLnd(shouldRestoreDefaults) {
      if (shouldRestoreDefaults) {
        if (!window.confirm("Are you sure you want to restore the default settings?")) {
          return;
        }
      }

      this.isSettingsDisabled = true;
      this.showValidationErrors = false;
      this.showServerError = false;

      this.setSpecialCaseSettings();

      try {
        const response = await API.post(
          `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/conf/lnd-config`,
          { lndConfig: shouldRestoreDefaults ? {} : this.settings }
        );

        if (response.data.status === "success") {
          // reload the page to reset all state and show loading view while lnd restarts.
          // if wtclient is currently active, delay the reload for 25 seconds to allow wtclient to shut down (takes ~20 seconds)
          if (this.lndConfig['wtclient.active']) {
            // disable modal close
            this.disableModalClose = true;

            this.showDelayRestartMessage = true;
            const watchtowerShutdownInterval = window.setInterval(() => {
              this.delayRestartProgress += 1;
              if (this.delayRestartProgress === 100) {
                window.clearInterval(watchtowerShutdownInterval);
                // wait 250ms before reloading the page to allow the progress bar to finish
                setTimeout(() => {
                  this.$router.push({ query: { restart: "1" } });
                  window.location.reload();
                }, 500);
              }
            }, 250);
          } else {
            this.$router.push({ query: { restart: "1" } });
            window.location.reload();
          }
        }
      } catch (error) {
        this.isSettingsDisabled = false;

        if (error.response.status === 400) {
          this.validationErrors = error.response.data.validationErrors;
          this.showValidationErrors = true;
          return;
        }

        this.serverError = error.response.data.message;
        this.showServerError = true;
      }
    },
    getValueAndUnit(str) {
      // returns {value, unit}, eg. for str = 30m,
      // the function returns { value: "30", unit: "m" }
      const [value, unit] = str.match(/([0-9]+)([a-zA-Z])/).slice(1);
      return { value, unit };
    },
    setSettings() {
      // deep clone lndConfig in order to properly reset state if user hides modal instead of clicking the save and restart button
      this.settings = cloneDeep(this.lndConfig);
      // alias
      this.aliasOnModalLoad = this.lndConfig['alias'] || this.alias;
      this.aliasInput = this.lndConfig['alias'] || this.alias;
      // payments-expiration-grace-period
      this.paymentsExpirationGracePeriod = this.getValueAndUnit(this.lndConfig['payments-expiration-grace-period']);
      // routerrpc.penaltyhalflife
      this.penaltyHalflife = this.getValueAndUnit(this.lndConfig['routerrpc.penaltyhalflife']);
      // db.bolt.auto-compact-min-age
      this.autoCompactMinAge = this.getValueAndUnit(this.lndConfig['db.bolt.auto-compact-min-age']);
    },
    resetRemoveWatchtowerError() {
      this.removeWatchtowerError = {
        watchtowerPubkey: "",
        status: false,
        message: ""
      };
    },
    fetchWatchtowerServiceUri() {
      this.$store.dispatch("lightning/getWatchtowerServiceUri");
    },
    fetchListWatchtowers() {
      this.$store.dispatch("lightning/listWatchtowers");
    },
    async addWatchtower(uri) {
      this.showAddWatchtowerError = false;
      this.showAddWatchtowerSuccess = false;
      if (!uri) return;
      // check if pubkey already exists. If so, then we show window confirmation so user
      // is aware that they are adding a new address for the same watchtower.
      const pubkey = uri.split("@")[0];
      const watchtowerExists = this.watchtowers.find(watchtower => watchtower.pubkey === pubkey);
      if (watchtowerExists) {
        if (!window.confirm(`Watchtower with pubkey ${pubkey} already exists. Do you wish to add a new address for the same watchtower?`)) {
          return;
        }
      }
      try {
        const response = await API.post(
          `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/watchtower/add-watchtower`,
          { uri }
        );
        if (response.data.success) {
          this.showAddWatchtowerSuccess = true;
        }
      } catch (error) {
        this.addWatchtowerError = `${error.response.data.error.message} - ${error.response.data.error.error.details}.`
        this.showAddWatchtowerError = true;
      }
      this.addWatchtowerInput = "";
      this.$store.dispatch("lightning/listWatchtowers");
    },
    async removeWatchtower(pubkey) {
      this.resetRemoveWatchtowerError();
      try {
        await API.post(
          `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/watchtower/remove-watchtower`,
          { pubkey }
        );
      } catch (error) {
        this.removeWatchtowerError = {
          watchtowerPubkey: pubkey,
          status: true,
          message: `${error.response.data.error.message} - ${error.response.data.error.error.details}.`
        };
      }
      this.$store.dispatch("lightning/listWatchtowers");
    },
    async removeWatchtowerAddress(pubkey, address) {
      this.resetRemoveWatchtowerError();
      try {
        await API.post(
          `${process.env.VUE_APP_API_BASE_URL}/v1/lnd/watchtower/remove-watchtower-address`,
          { pubkey, address }
        );
      } catch (error) {
        this.removeWatchtowerError = {
          watchtowerPubkey: pubkey,
          status: true,
          message: `${error.response.data.error.message} - ${error.response.data.error.error.details}.`
        };
      }
      this.$store.dispatch("lightning/listWatchtowers");
    }
  }
};
</script>

<style lang="scss" scoped>
.card {
  box-shadow: none;
}
.card:hover {
  box-shadow: none;
}

.error-message {
  font-size: 0.8rem;
}

.setting-group-container {
  border: 1px solid #e9ecef !important;
  border-radius: 0.5rem;

  .setting-group-header {
    cursor: pointer;
    background-color: transparent;
  }

  .collapsed > .when-open,
  .not-collapsed > .when-closed {
    display: none;
  }

  .setting-group-body {
    border-radius: 0 0 0.5rem 0.5rem;

    .subsetting-body {
      border-bottom: 1px solid #e9ecef;
  
      .subsetting-title {
        font-size: 0.9rem;
      }

      .subsetting-setting-lnd-name {
        font-size: 0.65rem;
        opacity: 0.6;
        margin-top: 0.1rem;
      }

      .input-container {
        width: 100%;
        max-width: 130px;

        .input-group-text {
          font-size: 0.85rem !important;
        }
      }

      .input-time {
        .input-group-append {
          .custom-select {

            font-size: 0.85rem !important;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            cursor: pointer;

            &:focus {
              box-shadow: none;
            }
          }
        }
      }

      .advanced-settings-input {
        font-size: 0.85rem !important;

        &:focus {
        box-shadow: none;
        }
      }

      // to remove arrows on number input field
      .advanced-settings-input::-webkit-outer-spin-button, .advanced-settings-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      
      .advanced-settings-input[type="number"] {
        -moz-appearance: textfield;
      }

      .add-btn {
        &:hover {
          background: #6c757d;
          border: 1px solid #6c757d !important;
          color: #ffffff !important;
        }
        font-size: 0.85rem;
        border: 1px solid #ced4da !important;
        color: #495057 !important;
        background: #ffffff;
      }

      .watchtower-list-container {
        border: 1px solid #e9ecef;
        border-radius: 0.5rem;

        .watchtower-subtitle {
          font-size: 0.85rem;
        }

        .watchtower-container {
          border: 1px solid #e9ecef !important;
          border-radius: 0.5rem;
          background-color: #f8f9fa;
          box-shadow: none;
          cursor: auto;

          .watchtower-header {
            background-color: transparent;
            cursor: default;
          }
          
          .watchtower-body {
            border-radius: 0 0 0.5rem 0.5rem;
          }
          
          .watchtower-divider-top {
            // same styles as bootstrap <b-dropdown-divider/>
            height: 0;
            margin-top: 0.25rem;
            margin-bottom: 0.5rem;
            overflow: hidden;
            border-top: 1px solid #e9ecef;
          }
          
          .watchtower-divider-bottom {
            // same styles as bootstrap <b-dropdown-divider/>
            height: 0;
            margin-top: 0.75rem;
            margin-bottom: 1.25rem;
            overflow: hidden;
            border-top: 1px solid #e9ecef;
          }

          .watchtower-info {
            font-size: 0.85rem;
          }

          .watchtower-icons {
            cursor: pointer;
          }
        }
      }
    }
  }
}

.btn-border {
  border: solid 1px !important;
}

.advanced-settings-modal-body {
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    margin-block-end: 1rem;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
}
</style>
