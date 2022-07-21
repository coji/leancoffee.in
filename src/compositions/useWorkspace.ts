import { ref, onMounted } from '@nuxtjs/composition-api'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { firebaseApp } from '~/plugins/firebase'
import { Workspace } from '~/interfaces/model'

export const useWorkspace = (workspaceId: string) => {
  const workspace = ref<Workspace>({
    id: '',
    name: '',
    meetings: []
  })
  const firestore = getFirestore(firebaseApp)

  onMounted(async () => {
    const snapshot = await getDoc(doc(firestore, `/workspaces/${workspaceId}`))
    workspace.value = Object.assign(
      { id: snapshot.id },
      snapshot.data()
    ) as Workspace
  })

  return {
    workspace
  }
}
