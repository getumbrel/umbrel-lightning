<template>
  <div class="d-flex align-items-center w-100 flex flex-column text-center p-3 pb-4">
    <h3>Welcome to the <br/> Lightning Network</h3>
    <img
      class="app-icon mt-3"
      src="@/assets/icon.svg"
    />
    <div class="mt-4 mb-3">
      <a
        href="#"
        class="text-center text-uppercase"
        :class="{'disabled-link': disabled}"
        @click.prevent="onRecoverNode"
      >
        Recover your previous node
      </a>
    </div>
    <div>
      <b-button
        variant="success px-4"
        :class="{'fade-in-out': loading}"
        :disabled="disabled"
        @click="onNewNode"
      >Setup a new node</b-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    disabled: Boolean,
    loading: Boolean,
    onRecoverNode: Function,
    onNewNode: Function,
  },
};
</script>

<style lang="scss">
.app-icon {
  height: 100px;
  width: 100px;
  border-radius: 22%;
}
</style>