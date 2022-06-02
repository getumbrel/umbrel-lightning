<template>
  <div class="pb-4 px-3"
    :class="{'pt-4': !disableVerify}"
  >
    <div class="d-flex align-items-center w-100 flex flex-column text-center">
      <h2 class="text-lowercase">Note down your secret words</h2>
      <p class="mb-3 w-75">
        Keep these words at a secure place. You’ll need these to recover your
        funds if something goes wrong with your node.
      </p>
      <div class="px-0 sm:px-2">
        <seed :words="seed"></seed>
      </div>
    </div>
    <div
      v-if="!disableVerify"
      class="d-flex flex-column justify-content-center align-items-center mt-4"
    >
      <div class="mb-4">
        <a href="#" class="text-center text-uppercase" @click.prevent="skipVerify">
          Note down later
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
    disableVerify: {
      type: Boolean,
    },
    skipVerify: {
      type: Function,
      default: () => {},
    },
    nextStep: {
      type: Function,
      default: () => {},
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
