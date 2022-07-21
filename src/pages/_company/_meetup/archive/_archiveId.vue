<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
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
          disabled: false,
          to: `/${meeting.workspaceId}/${meeting.id}`,
          nuxt: true,
          exact: true
        },
        {
          text: 'アーカイブ'
        }
      ]"
    />

    <v-row>
      <v-col cols="12" sm="4">
        <v-select
          v-model="currentArchive"
          outlined
          dense
          :items="archives"
          item-text="title"
          return-object
          label="アーカイブ"
          color="primary"
          filled
          @change="currentArchive && $router.push(currentArchive.id)"
        />

        <v-card outlined>
          <v-card-text>
            <div v-if="currentArchive && currentTopics">
              {{ $dayjs(currentArchive.createdAt.toDate()).format('LLL') }}
              作成アーカイブ<br />
              {{ currentTopics.length }}件のトピック
            </div>
          </v-card-text>

          <v-card-actions class="justify-center">
            <v-menu v-if="currentArchive" bottom offset-y open-on-hover>
              <template #activator="{ on }">
                <v-btn
                  block
                  :disabled="!currentArchive"
                  depressed
                  color="primary"
                  v-on="on"
                >
                  <v-icon>mdi-export</v-icon>
                  エクスポート(開発中)
                </v-btn>
              </template>

              <v-list dense>
                <v-list-item link @click="inDevDialog = true">
                  <v-list-item-icon>
                    <v-icon color="primary">
                      mdi-language-markdown-outline</v-icon
                    >
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>MarkDown テキスト</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-snackbar v-model="inDevDialog" color="error">
              エクスポート機能はまだ開発中です。もうちょっとお待ち下さい。
            </v-snackbar>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="8">
        <v-card v-if="currentTopics" outlined>
          <v-card-text>
            <v-data-table
              dense
              hide-default-footer
              item-key="id"
              :items-per-page="-1"
              :items="currentTopics"
              :headers="[
                {
                  text: 'トピック',
                  value: 'title'
                },
                {
                  text: 'メモ',
                  value: 'note'
                },
                {
                  text: '作成者',
                  value: 'createUser',
                  sort: sortFunc
                },
                {
                  text: '投票',
                  value: 'voters.length'
                },
                {
                  text: '経過',
                  value: 'duration',
                  sortable: false
                }
              ]"
              :options="{
                sortBy: ['voters.length', 'updatedAt', 'createdAt'],
                sortDesc: [true, true, true]
              }"
            >
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template #item.note="{ item }">
                <v-menu v-if="item.note" bottom offset-y left open-on-hover>
                  <template #activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon v-if="item.note">
                        mdi-comment-quote-outline
                      </v-icon>
                    </v-btn>
                  </template>
                  <v-card max-width="350">
                    <v-card-text>
                      <NoteView :value="item.note" />
                    </v-card-text>
                  </v-card>
                </v-menu>
              </template>

              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template #item.createUser="{ item }">
                <UserAvatar :user="item.createUser" />
              </template>

              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template #item.duration="{ item }">
                <div v-if="item.startAt && item.doneAt">
                  {{
                    $dayjs
                      .unix((item.doneAt - item.startAt) / 1000)
                      .format('m:ss')
                  }}
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  useRoute,
  useRouter,
  onMounted,
  watch
} from '@nuxtjs/composition-api'
import { Archive, Topic } from '~/interfaces/model'
import { useMeeting } from '~/compositions/useMeeting'
import { useArchive } from '~/compositions/useArchive'

export default defineComponent({
  middleware: 'auth',
  setup() {
    const router = useRouter()
    const { params } = useRoute().value
    const { loading: meetingLoading, meeting } = useMeeting(
      params.company,
      params.meetup
    )
    const {
      loading: archiveLoading,
      list,
      listTopics
    } = useArchive(params.company, params.meetup)

    const loading = computed(() => {
      return meetingLoading.value !== false && archiveLoading.value !== false
    })

    const archives = ref<Archive[]>([])
    const currentArchive = ref<Archive>()
    onMounted(async () => {
      archives.value = await list()
      if (params.archiveId) {
        currentArchive.value = archives.value.find(
          (e) => e.id === params.archiveId
        )
      } else if (archives.value.length > 0) {
        // 指定がない場合は最後のものにリダイレクト(履歴残さず)
        router.replace(archives.value[0].id)
      }
    })

    const currentTopics = ref<Topic[] | null>(null)
    watch(currentArchive, async (newVal) => {
      if (newVal) {
        currentTopics.value = await listTopics(newVal.id)
      } else {
        currentTopics.value = null
      }
    })

    const inDevDialog = ref(false)
    const sortFunc = (a: any, b: any) => {
      if (a.displayName < b.displayName) {
        return -1
      } else if (a.displayName > b.displayName) {
        return 1
      } else {
        return 0
      }
    }

    return {
      loading,
      meeting,

      archives,
      currentArchive,
      currentTopics,
      inDevDialog,
      sortFunc
    }
  }
})
</script>
