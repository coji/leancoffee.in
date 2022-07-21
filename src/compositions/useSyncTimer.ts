import {
  reactive,
  ref,
  toRefs,
  onMounted,
  onUnmounted,
  computed,
  useContext,
  watch
} from '@nuxtjs/composition-api'
import {
  ref as firebaseRef,
  onValue,
  getDatabase,
  update,
  serverTimestamp
} from 'firebase/database'
import { firebaseApp } from '~/plugins/firebase'

export const useSyncTimer = (workspaceId: string, meetingId: string) => {
  const $dayjs = useContext().$dayjs
  const now = $dayjs()
  const state = reactive({
    startAt: now,
    total: 0,
    now,
    duration: 5 * 60,
    active: false
  })

  const timeOffset = ref(0)
  const remains = computed(() => {
    const endAt = state.startAt.add(state.total, 'seconds')
    return Math.floor((endAt.diff(state.now) - timeOffset.value) / 1000)
  })

  watch(
    () => remains.value,
    (newVal, oldVal) => {
      if (oldVal > 0 && newVal <= 0) {
        // playAlerm()
      }
    }
  )

  let t = 0
  onMounted(() => {
    t = window.setInterval(() => {
      if (state.active) {
        state.now = $dayjs()
      }
    }, 200)
  })
  onUnmounted(() => {
    window.clearInterval(t)
  })

  const db = getDatabase(firebaseApp)
  const offsetRef = firebaseRef(db, '.info/serverTimeOffset')
  onValue(offsetRef, (snap) => {
    timeOffset.value = snap.val()
  })

  const timerRef = firebaseRef(db, `/${workspaceId}/${meetingId}/timer`)
  onValue(timerRef, (snapshot) => {
    const val = snapshot.val()
    if (val) {
      // ゼロになったらアラーム鳴らす
      state.startAt = $dayjs(val.startAt)
      state.total = val.total
      state.active = val.active
      state.duration = val.duration
    }
  })
  const start = () => {
    // playAlerm()
    update(timerRef, {
      startAt: serverTimestamp(),
      total: state.duration,
      active: true
    })
    state.total = state.duration
  }
  const stop = () => {
    update(timerRef, {
      active: false
    })
  }
  const setDuration = async (seconds: number) => {
    await update(timerRef, {
      duration: seconds
    })
  }

  return {
    ...toRefs(state),
    remains,
    start,
    stop,
    setDuration
  }
}
