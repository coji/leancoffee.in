<template>
  <span class="d-flex align-center">
    <v-chip
      small
      :color="statusColor + ' lighten-5'"
      :class="{
        [`${statusColor}--text`]: true
      }"
      label
    >
      <span class="font-weight-bold">{{ voters.length }}</span>
      <span class="ml-1">votes</span>
    </v-chip>
    <user-avatar
      v-if="voters.includes($currentUser.value.uid)"
      class="ml-n2"
      :user="$currentUser.value"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    statusColor: {
      type: String as PropType<string>,
      required: false,
      default: () => 'grey'
    },
    voters: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  setup() {}
})
</script>
