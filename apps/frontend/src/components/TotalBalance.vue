<template>
  <card-widget
    header="Total Balance"
    :sub-title="unit | formatUnit"
    :loading="lightningSyncPercent < 100"
  >
    <template v-slot:title>
      <div
        v-b-tooltip.hover.right
        :title="totalBalanceInSats | satsToUSD"
        v-if="totalBalance !== -1"
      >
        <CountUp
          :value="{
            endVal: totalBalance,
            decimalPlaces: unit === 'sats' ? 0 : 5,
          }"
        />
      </div>
      <span
        class="loading-placeholder loading-placeholder-lg"
        style="width: 140px;"
        v-else
      ></span>
    </template>

    <template v-slot:icon-replacement>
      <sats-btc-switch></sats-btc-switch>
    </template>

    <div class="pb-2">
    </div>
  </card-widget>
</template>

<script>
import { mapState } from "vuex";

import { satsToBtc } from "@/helpers/units.js";

import SatsBtcSwitch from "@/components/Utility/SatsBtcSwitch.vue";

import CountUp from "@/components/Utility/CountUp";
import CardWidget from "@/components/CardWidget";

export default {
  computed: {
    ...mapState({
      lightningSyncPercent: (state) => state.lightning.percent,
      unit: (state) => state.system.unit,
      state: state => state,
      totalBalance: (state) => {
        //skip if still loading
        if (state.bitcoin.balance.total === -1 || state.lightning.balance.total === -1) {
          return -1;
        }
        const totalBalance = state.bitcoin.balance.total + state.lightning.balance.total;
        if (state.system.unit === "btc") {
          return satsToBtc(totalBalance);
        }
        return totalBalance;
      },
      totalBalanceInSats: (state) => state.bitcoin.balance.total + state.lightning.balance.total,
    }),
  },
  methods: {},
  components: {
    CardWidget,
    CountUp,
    SatsBtcSwitch,
  },
};
</script>

<style lang="scss" scoped>
</style>
