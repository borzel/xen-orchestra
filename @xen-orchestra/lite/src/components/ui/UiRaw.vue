<template>
  <pre class="ui-raw"><slot /></pre>
</template>

<script lang="ts" setup></script>

<style lang="postcss" scoped>
.ui-raw {
  background-color: var(--color-blue-scale-400);
  text-align: left;
  overflow: auto;
  max-width: 100%;
  width: 48em;
  padding: 0.5em;
  border-radius: 8px;
  line-height: 150%;
}
</style>
