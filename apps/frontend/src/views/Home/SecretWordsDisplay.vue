<template>
  <div class="py-4 px-3">
    <div class="d-flex align-items-center w-100 flex flex-column text-center">
      <h2 class="lowercase">note down your secret words</h2>
      <p class="mb-5" style="width: 85%;">
        Keep these words at a secure place. You’ll need these to recover your
        funds if something goes wrong with your node.
      </p>
      <div class="px-0 sm:px-2">
        <seed :words="seed" v-if="seed.length"></seed>
      </div>
    </div>
    <div
      class="d-flex flex-column justify-content-center align-items-center mt-4"
    >
      <div class="mb-2">
        <a href="#" class="text-center" @click="skipVerify">
          NOTE DOWN LATER
        </a>
      </div>
      <div>
        <b-button variant="success px-3" @click="nextStep">Next</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Seed from "@/components/Utility/Seed";

export default {
  props: {
    skipVerify: {
      type: Function
    },
    nextStep: {
      type: Function
    }
  },
  computed: {
    ...mapState({
      seed: state => state.user.seed
    })
  },
  components: {
    Seed
  }
};
</script>
