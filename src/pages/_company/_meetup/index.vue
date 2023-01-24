<template>
  <div v-if="meetingLoading">Loading...</div>
  <div v-else style="position: relative">
    <v-breadcrumbs
      :items="[
        {
          text: 'TOP',
          disabled: false,
          to: '/',
          nuxt: true,
          exact: true
        },
        {
          text: meeting.workspaceName,
          disabled: false,
          to: `/${meeting.workspaceId}`,
          nuxt: true,
          exact: true
        },
        {
          text: meeting.title,
          disabled: false
        }
      ]"
    />

    <v-card tile flat color="transparent" class="" style="position: relative">
      <MeetingHeader class="white mt-n2 pt-2 pb-1">
        <template #title>
          <div>
            <v-card-title class="pa-0 flex-column align-start">
              <div>{{ meeting.title }}</div>
              <v-tooltip v-if="meeting" bottom left>
                <template #activator="{ on }">
                  <v-chip
                    x-small
                    class="text-uppercase"
                    color="secondary"
                    v-on="on"
                  >
                    {{ meeting.accessLevel }}
                  </v-chip>
                </template>
                アクセス許可範囲:
                <span v-if="meeting.accessLevel === 'workspace'">
                  同一ドメイン
                </span>
                <span v-if="meeting.accessLevel === 'private'">
                  プライベート
                </span>
                <span v-if="meeting.accessLevel === 'public'"> 公開 </span>
              </v-tooltip>
            </v-card-title>
          </div>
        </template>
        <template #status>
          <SyncTimer
            v-model="timer"
            class="flex-grow-1 order-last order-sm-0 mt-1 mt-sm-0"
            :class="{ 'pl-8': !$vuetify.breakpoint.xs }"
            :meeting="meeting"
          />
        </template>
        <template #menu>
          <div class="d-flex flex-column">
            <div class="d-flex align-center">
              <v-chip
                x-small
                :to="`${meeting.id}/archive/`"
                :outlined="!!meeting.numOfArchives"
                class="ml-2"
                color="primary"
              >
                <v-icon x-small>mdi-archive</v-icon>
                アーカイブ
                {{ meeting.numOfArchives }}
              </v-chip>

              <v-menu offset-y bottom left>
                <template #activator="{ on }">
                  <v-btn x-small icon color="primary" class="ml-1" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item
                    :disabled="
                      candidateTopics.length === 0 &&
                      nowTopics.length === 0 &&
                      doneTopics.length === 0
                    "
                    @click="dialogArchiveAll = true"
                  >
                    <v-list-item-icon>
                      <v-icon color="primary">mdi-archive-arrow-down</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        すべてアーカイブに保存
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <UserPresense
              v-if="!error"
              :meeting="meeting"
              :workspace-id="meeting.workspaceId"
              :meet-id="meeting.id"
            />
          </div>
        </template>
      </MeetingHeader>

      <DialogArchiveAll
        v-model="dialogArchiveAll"
        :width="$vuetify.breakpoint.xs ? undefined : '600'"
        :all-topics="allTopics"
        :meeting="meeting"
        @archived="handleArchived"
      />

      <v-card-text class="pa-0 mt-2 transparent">
        <v-row dense style="position: relative">
          <!-- candiadtes  -->
          <v-col cols="12" sm="4" order="2" order-sm="1">
            <div
              class="primary rounded px-2 py-1 white--text mb-2 d-flex align-center"
            >
              <div class="flex-grow-1">候補</div>
              <div class="d-inline-flex">
                <v-btn
                  x-small
                  :outlined="!sortByVotes"
                  depressed
                  color="white"
                  @click="sortByVotes = !sortByVotes"
                >
                  ソート
                </v-btn>
                <v-btn
                  x-small
                  outlined
                  dark
                  depressed
                  class="ml-1"
                  @click="handleClickAdd"
                >
                  追加
                </v-btn>
              </div>
            </div>

            <draggable
              v-model="candidateTopics"
              draggable=".item"
              group="items"
              :disabled="$vuetify.breakpoint.xs"
              @change="handleChangeCandidateItem"
              @start="drag = true"
              @end="drag = false"
            >
              <template v-for="topic of candidateTopics">
                <TopicCard
                  :key="topic.id"
                  :topic="topic"
                  :vote-up="handleVoteUp"
                  :vote-down="handleVoteDown"
                  class="item"
                  style="cursor: pointer"
                  @change="handleChangeTopic"
                />
              </template>

              <v-fade-transition>
                <v-card
                  v-if="drag && candidateTopics.length === 0"
                  slot="header"
                  color="grey lighten-3"
                  outlined
                >
                  <v-card-text class="text-center py-16">
                    ここにドロップ
                  </v-card-text>
                </v-card>
              </v-fade-transition>
            </draggable>

            <div class="text-center mt-2">
              <v-btn x-small outlined color="primary" @click="handleClickAdd">
                <v-icon x-small>mdi-plus</v-icon> 追加
              </v-btn>
            </div>
          </v-col>

          <!-- discussing now  -->
          <v-col cols="12" sm="4" order="1" order-sm="2">
            <div
              class="primary rounded px-2 py-1 white--text mb-2 d-flex align-center"
            >
              <div class="flex-grow-1">アジェンダ</div>
            </div>

            <draggable
              v-model="nowTopics"
              draggable=".item"
              group="items"
              :disabled="$vuetify.breakpoint.xs"
              @change="handleChangeNowItem"
              @start="drag = true"
              @end="drag = false"
            >
              <template v-for="topic of nowTopics">
                <TopicCard
                  :key="topic.id"
                  :topic="topic"
                  :vote-up="handleVoteUp"
                  :vote-down="handleVoteDown"
                  class="item"
                  style="cursor: pointer"
                  @change="handleChangeTopic"
                />
              </template>

              <v-fade-transition>
                <v-card
                  v-if="drag && nowTopics.length === 0"
                  slot="header"
                  color="grey lighten-3"
                  outlined
                >
                  <v-card-text class="text-center primary-text py-16">
                    ここにドロップ
                  </v-card-text>
                </v-card>
              </v-fade-transition>
            </draggable>
          </v-col>

          <!-- done -->
          <v-col cols="12" sm="4" order="3">
            <div class="primary rounded px-2 py-1 white--text mb-2">完了</div>

            <draggable
              v-model="doneTopics"
              draggable=".item"
              group="items"
              :disabled="$vuetify.breakpoint.xs"
              @change="handleChangeDoneItem"
              @start="drag = true"
              @end="drag = false"
            >
              <template v-for="topic of doneTopics">
                <TopicCard
                  :key="topic.id"
                  :topic="topic"
                  :vote-up="handleVoteUp"
                  :vote-down="handleVoteDown"
                  class="item"
                  style="cursor: pointer"
                  @change="handleChangeTopic"
                />
              </template>

              <v-fade-transition>
                <v-card
                  v-if="drag && doneTopics.length === 0"
                  slot="header"
                  color="grey lighten-3"
                  outlined
                >
                  <v-card-text class="text-center py-16">
                    ここにドロップ
                  </v-card-text>
                </v-card>
              </v-fade-transition>
            </draggable>
          </v-col>
        </v-row>
      </v-card-text>

      <v-dialog v-model="addDialog" max-width="600">
        <v-card>
          <v-toolbar dark dense flat color="primary">
            アジェンダ候補の追加
          </v-toolbar>
          <v-card-text class="mt-4">
            <form @submit.prevent="addTopic">
              <v-text-field
                v-model="addTitle"
                label="タイトル"
                outlined
                dense
                autofocus
                counter="50"
              />
            </form>
          </v-card-text>
          <v-card-actions>
            <v-btn text @click="addDialog = false">キャンセル</v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              depressed
              :disabled="!addTitle"
              @click="addTopic"
            >
              <v-icon small class="mr-1">mdi-plus</v-icon>
              追加
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable'
import {
  defineComponent,
  useContext,
  useRoute,
  ref,
  computed,
  watch
} from '@nuxtjs/composition-api'
import { Topic } from '~/interfaces/model'
import { useCurrentUser } from '~/compositions/useCurrentUser'
import { useMeeting } from '~/compositions/useMeeting'
import { useTopics } from '~/compositions/useTopics'

export default defineComponent({
  components: { draggable },
  middleware: 'auth',
  setup() {
    const { params } = useRoute().value
    const { currentUser } = useCurrentUser()
    const {
      loading: meetingLoading,
      meeting,
      fetch: fetchMeeting,
      error
    } = useMeeting(params.company, params.meetup)

    const { error: nuxtError } = useContext()
    watch(error, (val) => {
      if (val) {
        nuxtError({
          statusCode: 500,
          message: val.message
        })
        console.log('error', val)
      }
    })
    const {
      allTopics,
      update: updateTopic,
      add: addTopicApi,
      voteUp: handleVoteUp,
      voteDown: handleVoteDown
    } = useTopics(params.company, params.meetup)

    const sortByVotes = ref(false)

    const candidateTopics = computed({
      get: () => {
        if (sortByVotes.value) {
          return allTopics.candidate.value.sort(
            (a, b) => b.voters.length - a.voters.length
          )
        } else {
          return allTopics.candidate.value
        }
      },
      set: (value) => {
        allTopics.candidate.value = value
      }
    })
    const nowTopics = computed({
      get: () => {
        return allTopics.now.value
      },
      set: (value) => {
        allTopics.now.value = value
      }
    })
    const doneTopics = computed({
      get: () => {
        return allTopics.done.value
      },
      set: (value) => {
        allTopics.done.value = value
      }
    })

    const addDialog = ref(false)
    const handleClickAdd = () => {
      addDialog.value = true
    }

    const addTitle = ref('')
    const addTopic = () => {
      if (!currentUser.value) {
        return
      }
      addTopicApi(addTitle.value)
      addTitle.value = ''
      addDialog.value = false
    }

    const timer = ref(false)
    const handleChangeTopic = (target: Topic, diff: { [key: string]: any }) => {
      if (
        target.status !== 'now' &&
        diff.status === 'now' &&
        allTopics.now.value.length === 1
      ) {
        // アジェンダに新たに設定されたのでタイマー開始
        timer.value = true
      }
      if (
        target.status === 'now' &&
        diff.status !== 'now' &&
        allTopics.now.value.length === 0
      ) {
        // アジェンダが完了したのでタイマー終了
        timer.value = false
      }
      updateTopic(target.id, diff)
    }

    const dialogArchiveAll = ref(false)
    const handleArchived = (archiveId: string) => {
      fetchMeeting()
      console.log('archived:', archiveId)
    }

    const drag = ref(false)
    const handleChangeCandidateItem = (e: any) => {
      if (e.added) {
        handleChangeTopic(e.added.element, { status: 'candidate' })
      }
    }
    const handleChangeNowItem = (e: any) => {
      if (e.added) {
        handleChangeTopic(e.added.element, { status: 'now' })
      }
    }
    const handleChangeDoneItem = (e: any) => {
      if (e.added) {
        handleChangeTopic(e.added.element, { status: 'done' })
      }
    }

    return {
      error,

      meetingLoading,
      meeting,

      allTopics,
      addDialog,
      handleClickAdd,
      addTitle,
      addTopic,

      candidateTopics,
      nowTopics,
      doneTopics,

      timer,

      handleChangeTopic,
      handleVoteUp,
      handleVoteDown,
      sortByVotes,

      dialogArchiveAll,
      handleArchived,

      drag,
      handleChangeCandidateItem,
      handleChangeNowItem,
      handleChangeDoneItem
    }
  }
})
</script>
