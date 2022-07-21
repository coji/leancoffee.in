import { reactive, toRefs } from '@nuxtjs/composition-api'
import {
  FirestoreError,
  getFirestore,
  serverTimestamp,
  increment,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  collection,
  updateDoc,
  DocumentData
} from 'firebase/firestore'
import { firebaseApp } from '~/plugins/firebase'
import { useCurrentUser } from '~/compositions/useCurrentUser'
import { Archive, Topic } from '~/interfaces/model'
import { topicConverter } from '~/helpers/firestore-converters'

export const useArchive = (workspaceId: string, meetingId: string) => {
  const state = reactive<{
    loading: boolean
    error: FirestoreError | null
  }>({
    loading: false,
    error: null
  })

  const { currentUser } = useCurrentUser()

  const list = async () => {
    const archives: Archive[] = []
    if (!currentUser.value) {
      return archives
    }
    state.loading = true
    try {
      const firestore = getFirestore(firebaseApp)
      const q = query(
        collection(
          firestore,
          `/workspaces/${workspaceId}/meetings/${meetingId}/archives`
        ),
        orderBy('createdAt', 'desc')
      )
      const docs = await getDocs(q)
      docs.docs.forEach((e) => {
        archives.push(Object.assign({ id: e.id }, e.data()) as Archive)
      })
    } catch (err) {
      console.log(err)
      state.error = err
    }
    state.loading = false
    return archives
  }

  const listTopics = async (archiveId: string) => {
    const topics: Topic[] = []
    if (!currentUser.value) {
      return topics
    }
    state.loading = true
    try {
      const firestore = getFirestore(firebaseApp)
      const q = query(
        collection(
          firestore,
          `/workspaces/${workspaceId}/meetings/${meetingId}/topics`
        ),
        where('archiveId', '==', archiveId)
      ).withConverter(topicConverter)
      const docs = await getDocs(q)
      docs.docs.forEach((e) => {
        topics.push(Object.assign({ id: e.id }, e.data()) as Topic)
      })
    } catch (err) {
      console.log(err)
      state.error = err
    }
    state.loading = false
    return topics
  }

  // アーカイブ追加
  const addArchive = async (title: string) => {
    if (!currentUser.value) {
      return null
    }

    let archiveDoc: DocumentData | null = null
    state.loading = true
    try {
      const firestore = getFirestore(firebaseApp)
      archiveDoc = await addDoc(
        collection(
          firestore,
          `/workspaces/${workspaceId}/meetings/${meetingId}/archives`
        ),
        {
          title,
          createUser: {
            uid: currentUser.value.uid,
            displayName: currentUser.value.displayName,
            photoURL: currentUser.value.photoURL
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      )

      if (archiveDoc) {
        const meetingRef = doc(
          firestore,
          `/workspaces/${workspaceId}/meetings/${meetingId}`
        )
        updateDoc(meetingRef, { numOfArchives: increment(1) })

        // created
        const q = query(
          collection(
            firestore,
            `/workspaces/${workspaceId}/meetings/${meetingId}/topics`
          ),
          where('status', 'in', ['candidate', 'now', 'done'])
        )

        const querySnapshot = await getDocs(q)
        if (querySnapshot) {
          querySnapshot.forEach(async (topic) => {
            await updateDoc(topic.ref, {
              archiveId: archiveDoc!.id,
              status: 'archive'
            })
          })
        }
      }
    } catch (err) {
      console.log(err)
      state.error = err
    }

    state.loading = false
    return archiveDoc ? archiveDoc.id : null
  }

  return {
    list,
    listTopics,
    addArchive,
    ...toRefs(state)
  }
}
