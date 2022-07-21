<template>
  <div>
    <div
      v-if="!edit"
      style="cursor: pointer"
      class="text-subtitle-1"
      @click.stop="edit = true"
    >
      <span v-if="value && value.toString().trim() !== ''">
        {{ value }}
      </span>
      <span v-else> &nbsp; </span>
    </div>

    <v-text-field
      v-else
      v-model="internalValue"
      hide-details
      outlined
      dense
      autofocus
      @change="onChangeValue"
      @blur="edit = false"
    >
      <template #append-outer>
        <v-btn x-small depressed color="primary" @click.stop="onChangeValue">
          OK
        </v-btn>
      </template>
    </v-text-field>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, watch } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
      type: String as PropType<string | null>,
      required: false,
      default: () => null
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

    return {
      internalValue,
      edit,
      onChangeValue
    }
  }
})
</script>
