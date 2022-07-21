<template>
  <!-- user presence -->
  <v-menu open-on-hover offset-y bottom left transition="slide-y-transition">
    <template #activator="{ on }">
      <div class="d-flex justify-end" v-on="on">
        <v-avatar
          v-for="(user, idx) of users"
          :key="user.uid"
          size="20"
          :class="{ 'ml-n2': idx > 0 }"
        >
          <v-img :src="user.photoURL" />
        </v-avatar>
        <v-avatar v-if="users.length === 0" size="20"> </v-avatar>
      </div>
    </template>

    <v-list dense>
      <v-subheader>オンライン</v-subheader>
      <v-list-item v-for="user of users" :key="user.uid">
        <v-list-item-avatar>
          <v-avatar size="40">
            <v-img :src="user.photoURL" />
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ user.displayName }}
          </v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
          <v-list-item-action-text>
            {{ $dayjs(user.connectedAt).format('M月D日 HH:mm') }}
          </v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  PropType
} from '@nuxtjs/composition-api'
import { useCurrentUser } from '~/compositions/useCurrentUser'
import { usePresence } from '~/compositions/usePresense'
import { Meeting } from '~/interfaces/model'
export default defineComponent({
  props: {
    meeting: {
      type: Object as PropType<Meeting>,
      required: true
    }
  },
  setup(props) {
    const { currentUser } = useCurrentUser()
    const { users, enter, leave } = usePresence(
      props.meeting.workspaceId,
      props.meeting.id
    )

    let t = 0
    const tick = ref(0)
    onMounted(() => {
      if (currentUser.value) {
        enter(currentUser.value)
      }
      t = window.setInterval(() => {
        tick.value++
      }, 1000)
    })
    onUnmounted(() => {
      if (currentUser.value) {
        leave()
      }
      window.clearInterval(t)
    })

    return {
      users,
      enter,
      leave
    }
  }
})
</script>
