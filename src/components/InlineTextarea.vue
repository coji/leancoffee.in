<template>
  <div>
    <div v-if="!edit" style="cursor: pointer" @click.stop="edit = true">
      <NoteView :value="value" />
    </div>

    <v-textarea
      v-else
      v-model="internalValue"
      hide-details
      outlined
      dense
      autofocus
      auto-grow
      rows="1"
      @change="onChangeValue"
      @blur="edit = false"
    >
      <template #append-outer>
        <v-btn x-small color="primary" depressed @click.stop="onChangeValue">
          OK
        </v-btn>
      </template>
    </v-textarea>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  watch,
  onMounted,
  onUnmounted
} from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
      type: String as PropType<string | null>,
      required: false,
      default: () => null
    },
    controls: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: () => false
    }
  },
  setup(props, ctx) {
    const internalValue = ref(props.value)
    const edit = ref(false)

    watch(
      () => props.value,
      (newVal) => {
        internalValue.value = newVal
      }
    )

    const onChangeValue = () => {
      ctx.emit('input', internalValue.value)
      edit.value = false
    }

    let timer = 0
    onMounted(() => {
      // 入力中の更新を2秒毎にチェックし、更新されていれば反映。
      timer = window.setInterval(() => {
        if (
          edit.value &&
          props.value !== internalValue.value &&
          internalValue.value !== ''
        ) {
          ctx.emit('input', internalValue.value)
        }
      }, 2000)
    })

    onUnmounted(() => {
      window.clearInterval(timer)
    })

    return {
      internalValue,
      edit,
      onChangeValue
    }
  }
})
</script>
