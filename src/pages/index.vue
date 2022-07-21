<template>
  <div>
    <client-only>
      <v-card
        v-if="currentUser"
        flat
        style="height: 60vh"
        class="justify-center d-flex align-center flex-column mx-auto"
        :width="$vuetify.breakpoint.xs ? undefined : '350'"
      >
        <v-card-text>
          <div class="d-flex align-center">
            <span class="d-inline primary--text font-weight-bold">
              leancoffee.in/
            </span>
            <v-text-field
              v-model="workspace"
              hide-details
              outlined
              dense
              autofocus
              label="ワークスペースID"
              class="d-inline ml-1"
              @keyup.enter="$router.push(`/${workspace}`)"
            />
          </div>

          <v-btn
            color="primary"
            depressed
            block
            class="mt-2"
            :disabled="workspace.length < 4"
            @click="$router.push(`/${workspace}`)"
          >
            Let's talk
          </v-btn>
        </v-card-text>
      </v-card>
      <SigninPanel v-if="!currentUser" />
    </client-only>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'
import { useCurrentUser } from '~/compositions/useCurrentUser'

export default defineComponent({
  setup() {
    const { currentUser } = useCurrentUser()
    const workspace = ref('')
    return {
      currentUser,
      workspace
    }
  }
})
</script>
