<template>
  <v-card flat color="transparent">
    <v-card-title>
      <div class="flex-grow-1">{{ workspace.name }}</div>
      <!--
      <div>
        <v-btn color="primary" depressed @click="dialog = true">
          新規作成
        </v-btn>
      </div>
        -->
    </v-card-title>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title> ミーティングの新規作成 </v-card-title>
        <v-card-text>
          <v-text-field dense outlined label="タイトル" />
          <v-select
            dense
            :items="['非公開', '公開']"
            outlined
            label="公開範囲"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" depressed>新規作成</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card-text>
      <v-row>
        <v-col
          v-for="meeting of workspace.meetings"
          :key="meeting.id"
          cols="12"
          sm="4"
        >
          <v-card :to="`/${$route.params.company}/${meeting.id}`">
            <v-card-title>{{ meeting.title }}</v-card-title>
            <v-card-text>
              {{ meeting.accessLevel }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, useRoute } from '@nuxtjs/composition-api'
import { useWorkspace } from '~/compositions/useWorkspace'

export default defineComponent({
  middleware: 'auth',
  setup() {
    const dialog = ref(false)
    const route = useRoute()
    const { workspace } = useWorkspace(route.value.params.company)

    return {
      dialog,
      workspace
    }
  }
})
</script>
