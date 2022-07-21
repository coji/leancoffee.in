import { ref, onMounted, onUnmounted } from '@nuxtjs/composition-api'
import {
  getFirestore,
  collection,
  query,
  updateDoc,
  addDoc,
  doc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Unsubscribe,
  where,
  serverTimestamp
} from 'firebase/firestore'
import { firebaseApp } from '~/plugins/firebase'
import { Topic } from '~/interfaces/model'
import { useCurrentUser } from '~/compositions/useCurrentUser'
import { topicConverter } from '~/helpers/firestore-converters'

export const useTopics = (workspaceId: string, meetingId: string) => {
  const topics = ref<Topic[]>([])

  const allTopics = {
    candidate: ref<Topic[]>([]),
    now: ref<Topic[]>([]),
    done: ref<Topic[]>([])
  }

  const error =
    ref<{
      name: string
      message: string
    } | null>(null)
  const firestore = getFirestore(firebaseApp)

  const unsubscribes = <
    {
      [status: string]: Unsubscribe | null
    }
  >{
    candidate: null,
    now: null,
    done: null
  }
  const statuses = ['candidate', 'now', 'done']

  onMounted(() => {
    statuses.forEach((status) => {
      const q = query(
        collection(
          firestore,
          `/workspaces/${workspaceId}/meetings/${meetingId}/topics`
        ),
        where('status', '==', status)
      ).withConverter(topicConverter)

      unsubscribes[status] = onSnapshot(
        q,
        (snapshot) => {
          const ret: Topic[] = []
          snapshot.forEach((doc) => {
            ret.push(doc.data())
          })

          allTopics[status as 'candidate' | 'now' | 'done'].value = ret.sort(
            (a, b) => {
              if (a.createdAt?.unix && b.createdAt?.unix)
                return a.createdAt.unix() - b.createdAt.unix()
              // 新規作成された直後は createdAt, updatedAt は undefined
              return 0
            }
          )
        },
        (err) => {
          error.value = {
            name: err.name,
            message: err.message
          }
        }
      )
    })
  })

  onUnmounted(() => {
    statuses.forEach((status) => {
      const unsub = unsubscribes[status]
      if (unsub) unsub()
    })
  })

  const { currentUser } = useCurrentUser()
  const add = async (title: string) => {
    if (!currentUser.value) {
      return
    }

    const newTopic = {
      title,
      attachments: [],
      note: null,
      status: 'candidate',
      voters: [],
      createUser: {
        uid: currentUser.value.uid,
        photoURL: currentUser.value.photoURL,
        displayName: currentUser.value.displayName
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    await addDoc(
      collection(
        firestore,
        `/workspaces/${workspaceId}/meetings/${meetingId}/topics`
      ),
      newTopic
    )
  }

  const update = async (id: string, diff: { [key: string]: any }) => {
    const docRef = doc(
      firestore,
      `/workspaces/${workspaceId}/meetings/${meetingId}/topics/${id}`
    )

    if (diff.status === 'now') {
      diff.startAt = serverTimestamp()
    }

    if (diff.status === 'done') {
      diff.doneAt = serverTimestamp()
    }

    await updateDoc(
      docRef,
      Object.assign({ updatedAt: serverTimestamp() }, diff)
    )
  }

  const voteUp = async (id: string, uid: string) => {
    const docRef = doc(
      firestore,
      `/workspaces/${workspaceId}/meetings/${meetingId}/topics/${id}`
    )
    await updateDoc(docRef, {
      updatedAt: serverTimestamp(),
      voters: arrayUnion(uid)
    })
  }

  const voteDown = async (id: string, uid: string) => {
    const docRef = doc(
      firestore,
      `/workspaces/${workspaceId}/meetings/${meetingId}/topics/${id}`
    )
    await updateDoc(docRef, {
      updatedAt: serverTimestamp(),
      voters: arrayRemove(uid)
    })
  }

  return {
    allTopics,
    topics,
    error,
    update,
    add,
    voteUp,
    voteDown
  }
}
