<template>
  <div class="py-4 px-3">
    <div class="d-flex align-items-center w-100 flex flex-column text-center">
      <h2 class="lowercase">enter your secret words</h2>
      <p class="mb-5">
        Enter your secret words in the exact order to verify you’ve correctly
        noted them down.
      </p>
      <seed-verify
        :words="seed"
        :nextStep="nextStep"
        :prevStep="prevStep"
      ></seed-verify>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import SeedVerify from "@/components/Utility/SeedVerify";

export default {
  props: {
    nextStep: {
      type: Function
    },
    prevStep: {
      type: Function
    }
  },
  computed: {
    ...mapState({
      seed: state => state.user.seed
    })
  },
  components: {
    SeedVerify
  }
};
</script>
