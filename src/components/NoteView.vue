<template>
  <div v-if="value" @click="onClickView">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="linkifiedNote" />
  </div>
  <div v-else>&nbsp;</div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@nuxtjs/composition-api'
import linkifyStr from 'linkifyjs/string'

export default defineComponent({
  props: {
    value: {
      type: String as PropType<string>,
      required: false,
      default: () => null
    }
  },
  setup(props) {
    const onClickView = (e: Event) => {
      console.log('onClickView:', e)
    }

    const linkifiedNote = computed(() => {
      return linkifyStr(props.value, {
        defaultProtocol: 'https',
        nl2br: true
      })
    })

    return {
      onClickView,
      linkifiedNote
    }
  }
})
</script>
