<template>
  <div v-if="value">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="linkifiedNote" />
  </div>
  <div v-else>&nbsp;</div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@nuxtjs/composition-api'
import linkifyHtml from 'linkify-html'

export default defineComponent({
  props: {
    value: {
      type: String as PropType<string>,
      required: false,
      default: () => null
    }
  },
  setup(props) {
    const linkifiedNote = computed(() => {
      return linkifyHtml(props.value, {
        defaultProtocol: 'https',
        nl2br: true,
        target: '_blank'
      })
    })

    return {
      linkifiedNote
    }
  }
})
</script>
