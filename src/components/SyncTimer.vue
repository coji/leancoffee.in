<template>
  <div class="d-flex justify-end">
    <v-slide-x-reverse-transition>
      <v-progress-linear
        v-if="active"
        reverse
        :value="remains > 0 ? (remains / total) * 100 : 100"
        :indeterminate="active && remains <= 0"
        height="36"
        :color="color"
        rounded
      >
        <span v-if="remains >= 0" :class="{ [`${textColor}`]: true }">
          {{ $dayjs.unix(remains).format('m:ss') }}
        </span>
        <span v-else :class="{ [`${textColor}`]: true }">
          -{{ $dayjs.unix(-remains).format('m:ss') }}
        </span>
      </v-progress-linear>
    </v-slide-x-reverse-transition>

    <div class="pl-2 d-flex align-center">
      <v-menu buttom offset-y open-on-hover @click.stop>
        <template #activator="{ on }">
          <v-btn
            :color="color"
            outlined
            depressed
            v-on="on"
            @click="toggleTimer"
          >
            <v-icon class="mr-2">mdi-timer</v-icon>
            {{ active ? '停止' : '開始' }}
          </v-btn>
        </template>

        <v-list v-if="!active" dense>
          <v-list-item-group :value="Math.floor(duration / 60)" mandatory>
            <template v-for="t of [1, 3, 5, 7, 10]">
              <v-list-item
                :key="`duration-${t}`"
                color="primary"
                :value="t"
                @click.stop="onClickDuration(t)"
              >
                <v-list-item-content>
                  <v-list-item-title> {{ t }}分 </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  watch
} from '@nuxtjs/composition-api'
import { useSyncTimer } from '~/compositions/useSyncTimer'
import { Meeting } from '~/interfaces/model'

export default defineComponent({
  props: {
    value: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: () => false
    },
    meeting: {
      type: Object as PropType<Meeting>,
      required: true
    }
  },
  setup(props, { emit }) {
    const { total, remains, now, duration, active, start, stop, setDuration } =
      useSyncTimer(props.meeting.workspaceId, props.meeting.id)

    const onClickDuration = async (minutes: number) => {
      await setDuration(minutes * 60)
      start()
    }

    watch(
      () => props.value,
      (newVal) => {
        if (newVal && !active.value) {
          start()
        } else if (!newVal && active.value) {
          stop()
        }
      }
    )

    watch(active, (newVal) => {
      emit('input', newVal)
    })

    const toggleTimer = () => {
      if (active.value) {
        stop()
      } else {
        start()
      }
    }

    const color = computed(() => {
      if (active.value) {
        if (remains.value > 0) {
          if (remains.value < total.value / 2) {
            return 'warning'
          } else {
            return 'success darken-2'
          }
        } else {
          return 'error'
        }
      } else {
        return 'primary'
      }
    })

    const textColor = computed(() => {
      if (active.value) {
        if (remains.value > 0) {
          if (remains.value < total.value / 2) {
            return 'warning--text'
          } else {
            return 'white--text'
          }
        } else {
          return 'error--text'
        }
      } else {
        return 'primary--text'
      }
    })

    return {
      now,
      total,
      remains,
      active,

      duration,
      onClickDuration,

      toggleTimer,
      textColor,
      color
    }
  }
})
</script>
