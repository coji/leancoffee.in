<template>
  <v-card
    outlined
    class="mt-2"
    @mouseenter="isShowControl = true"
    @mouseleave="isShowControl = false"
  >
    <v-card-text class="pt-2 px-2 pb-0">
      <div class="d-flex flex-nowrap align-start">
        <inline-text-field v-model="title" class="flex-grow-1" />
        <v-fade-transition>
          <user-avatar
            v-if="topic.createUser"
            class="ml-1"
            :user="topic.createUser"
          />
        </v-fade-transition>
      </div>

      <inline-textarea
        v-if="note"
        v-model="note"
        class="mr-2 flex-grow-1 text-caption"
      />
    </v-card-text>

    <v-card-actions>
      <TopicVoters :status-color="statusColor" :voters="voters" />

      <v-fade-transition>
        <div
          v-if="isShowControl || menu"
          class="d-flex flex-grow-1 align-center"
        >
          <v-btn
            v-if="!isVoted && (status === 'candidate' || status === 'now')"
            color="blue"
            class="ml-1"
            outlined
            x-small
            @click="onVoteUp"
          >
            投票
          </v-btn>
          <v-btn
            v-if="isVoted && (status === 'candidate' || status === 'now')"
            color="blue"
            class="ml-1"
            outlined
            x-small
            @click="onVoteDown"
          >
            取消
          </v-btn>

          <v-spacer />

          <v-btn
            v-if="!note"
            color="grey"
            class="mr-1"
            outlined
            x-small
            @click="note = 'メモ: '"
          >
            メモ追加
          </v-btn>

          <v-menu v-model="menu" bottom offset-y left>
            <template #activator="{ on }">
              <v-btn icon x-small v-on="on">
                <v-icon x-small>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list dense>
              <v-list-item
                v-if="status === 'candidate'"
                @click="status = 'now'"
              >
                <v-list-item-content> アジェンダに設定 </v-list-item-content>
              </v-list-item>

              <v-list-item
                v-if="status === 'now'"
                @click="status = 'candidate'"
              >
                <v-list-item-content> 候補に戻す </v-list-item-content>
              </v-list-item>

              <v-list-item v-if="status === 'now'" @click="status = 'done'">
                <v-list-item-content> 完了 </v-list-item-content>
              </v-list-item>

              <v-list-item v-if="status === 'done'" @click="status = 'now'">
                <v-list-item-content> アジェンダに戻す </v-list-item-content>
              </v-list-item>

              <v-list-item @click="deleteDialog = true">
                <v-list-item-content class="error--text">
                  削除
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-fade-transition>
    </v-card-actions>

    <v-dialog v-model="deleteDialog" width="350">
      <v-toolbar dark color="error" dense>
        <v-toolbar-title>
          <v-icon>mdi-delete</v-icon>
          トピックの削除
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon small @click="deleteDialog = false">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card tile class="mx-auto">
        <v-card-title></v-card-title>
        <v-card-text>
          トピック「{{ title }}」を削除します。よろしいですか？
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="deleteDialog = false">キャンセル</v-btn>
          <v-spacer />
          <v-btn
            color="error"
            depressed
            @click="
              status = 'delete'
              deleteDialog = false
            "
          >
            <v-icon>mdi-delete</v-icon>
            削除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  PropType
} from '@nuxtjs/composition-api'
import { useCurrentUser } from '~/compositions/useCurrentUser'
import { Topic } from '~/interfaces/model'

export default defineComponent({
  props: {
    topic: {
      type: Object as PropType<Topic>,
      required: true
    },
    voteUp: {
      type: Function as PropType<(topicId: string, uid: string) => void | null>,
      required: false,
      default: null
    },
    voteDown: {
      type: Function as PropType<(topicId: string, uid: string) => void | null>,
      required: false,
      default: null
    }
  },
  setup(props, { emit }) {
    const { currentUser } = useCurrentUser()
    const isShowControl = ref(false)

    const updateValue = (diff: Object) => {
      emit('change', props.topic, diff)
    }
    const title = computed({
      set: (title) => updateValue({ title }),
      get: () => props.topic.title
    })
    const note = computed({
      set: (note) => updateValue({ note }),
      get: () => props.topic.note
    })
    const status = computed({
      set: (status) => updateValue({ status }),
      get: () => props.topic.status
    })
    const voters = computed({
      set: (voters) => updateValue({ voters }),
      get: () => props.topic.voters
    })

    const onVoteUp = () => {
      if (currentUser.value && props.voteUp)
        props.voteUp(props.topic.id, currentUser.value.uid)
    }
    const onVoteDown = () => {
      if (currentUser.value && props.voteUp)
        props.voteDown(props.topic.id, currentUser.value.uid)
    }
    const isVoted = computed(() => {
      return currentUser.value && voters.value.includes(currentUser.value.uid)
    })

    const statusColor = computed(() => {
      const map = {
        candidate: 'blue',
        now: 'pink',
        done: 'grey'
      }
      if (props.topic.status === 'archive' || props.topic.status === 'delete')
        return map.done
      if (props.topic.voters.length === 0) return map.done
      return map[props.topic.status]
    })

    const menu = ref(false)
    const deleteDialog = ref(false)

    return {
      isShowControl,
      title,
      note,
      status,
      voters,
      onVoteUp,
      onVoteDown,
      isVoted,
      statusColor,
      menu,
      deleteDialog
    }
  }
})
</script>
