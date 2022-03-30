<template>
  <b-modal id="secret-words-modal" size="xl" centered hide-footer hide-header>
    <template #default="{ hide }">
      <div
        class="py-3 px-2 d-flex align-items-center w-100 flex flex-column text-center"
      >
        <h2 class="lowercase">note down your secret words</h2>
        <p class="mb-4 w-75">
          Keep these words at a secure place. You’ll need these to recover
          yourfunds if something goes wrong with your node.
        </p>
        <seed :words="seed" v-if="seed.length"></seed>
        <a href="#" class="text-center mt-3" v-on:click.stop.prevent="hide">
          Note down later
        </a>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapState } from "vuex";

import Seed from "@/components/Utility/Seed";

export default {
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
