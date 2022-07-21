<template>
  <v-dialog
    :value="value"
    v-bind="$attrs"
    scrollable
    :loading="loading"
    @input="$emit('input', $event)"
    v-on="$listeners"
  >
    <v-card>
      <v-toolbar flat dark color="primary" dense>
        <v-toolbar-title>
          <v-icon>mdi-archive-arrow-down</v-icon>
          すべてアーカイブして保存
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon small @click="handleCancel">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mt-4">
        <div v-if="loading">
          アーカイブしています。
          <div>
            <v-progress-circular :indeterminate="loading" />
          </div>
        </div>
        <div v-else>
          {{ numOfTopics }}件のトピックをすべてアーカイブして保存します。
          <v-text-field
            v-model="title"
            hide-details
            outlined
            dense
            autofocus
            label="アーカイブ名"
            class="mt-4"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" text @click="handleCancel"> キャンセル </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          depressed
          :disabled="numOfTopics === 0 || !title || title.length < 4"
          @click="handleOk"
        >
          アーカイブ
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  PropType,
  computed,
  useContext
} from '@nuxtjs/composition-api'
import { Topic, Meeting } from '~/interfaces/model'
import { useArchive } from '~/compositions/useArchive'

export default defineComponent({
  props: {
    value: {
      type: Boolean as PropType<boolean>,
      required: true
    },
    allTopics: {
      type: Object as PropType<{
        candidate: Ref<Topic[]>
        now: Ref<Topic[]>
        done: Ref<Topic[]>
      }>,
      required: true
    },
    meeting: {
      type: Object as PropType<Meeting>,
      required: true
    }
  },
  setup(props, { emit }) {
    const { $dayjs } = useContext()
    const numOfTopics = computed(
      () =>
        props.allTopics.candidate.value.length +
        props.allTopics.now.value.length +
        props.allTopics.done.value.length
    )
    const { addArchive } = useArchive(
      props.meeting.workspaceId,
      props.meeting.id
    )

    const title = ref<string | null>(null)
    title.value = `${props.meeting.title} - ${$dayjs().format(
      'YYYY年M月D日(ddd)'
    )}`

    const handleCancel = () => {
      emit('input', false)
    }

    const loading = ref(false)
    const handleOk = async () => {
      loading.value = true
      if (title.value) {
        const archiveId = await addArchive(title.value)
        if (archiveId) emit('archived', archiveId)
      }
      title.value = null
      loading.value = false
      emit('input', false)
    }

    return {
      numOfTopics,
      title,
      loading,
      handleCancel,
      handleOk
    }
  }
})
</script>
