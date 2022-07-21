import { onMounted, ref, reactive, toRefs } from '@nuxtjs/composition-api'
import { getFirestore, doc, getDoc, FirestoreError } from 'firebase/firestore'
import { firebaseApp } from '~/plugins/firebase'
import { Meeting } from '~/interfaces/model'

export const useMeeting = (workspaceId: string, meetingId: string) => {
  const state = reactive<{ loading: boolean; error: FirestoreError | null }>({
    loading: false,
    error: null
  })

  const meeting = ref<Meeting>({
    id: meetingId,
    title: '',
    description: '',
    guests: [],
    workspaceId,
    workspaceName: '',
    accessLevel: 'workspace',
    updatedAt: '',
    createdAt: ''
  })
  const firestore = getFirestore(firebaseApp)

  const fetch = async () => {
    state.loading = true

    try {
      const snapshot = await getDoc(
        doc(firestore, `/workspaces/${workspaceId}/meetings/${meetingId}`)
      )
      if (snapshot) {
        meeting.value = Object.assign(
          { id: snapshot.id },
          snapshot.data()
        ) as Meeting
      }
    } catch (err) {
      console.log(err)
      state.error = err as FirestoreError
    }
    state.loading = false
  }

  onMounted(() => {
    fetch()
  })

  return {
    ...toRefs(state),
    meeting,
    fetch
  }
}
