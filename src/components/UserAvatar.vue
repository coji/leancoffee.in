<template>
  <div class="text-right d-flex align-start">
    <v-menu open-on-hover offset-y left>
      <template #activator="{ on }">
        <v-avatar size="20" v-on="on">
          <v-img :src="photoURL" />
        </v-avatar>
      </template>
      <v-card class="px-2 py-1 caption">{{ displayName }}</v-card>
    </v-menu>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  PropType
} from '@nuxtjs/composition-api'
import { User } from '~/interfaces/model'

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  setup(props) {
    const user = reactive(props.user)
    return {
      ...toRefs(user)
    }
  }
})
</script>
