import { ref } from '@nuxtjs/composition-api'
import {
  ref as firebaseRef,
  onValue,
  onDisconnect,
  push,
  set,
  remove,
  DatabaseReference,
  getDatabase,
  serverTimestamp
} from 'firebase/database'
import { firebaseApp } from '~/plugins/firebase'
import { User } from '~/interfaces/user'

interface Presense extends User {
  connectedAt: number
}

// 配列から重複をなくす
function uniq(array: any) {
  return [...new Set(array)]
}

export const usePresence = (workspaceId: string, meetingId: string) => {
  const users = ref<Presense[]>([])
  let presenseRef: DatabaseReference | null = null

  const db = getDatabase(firebaseApp)
  const meetRef = firebaseRef(db, `/${workspaceId}/${meetingId}`)
  onValue(meetRef, (snapshot) => {
    const val = snapshot.val()

    // オンラインユーザの uid リスト (uidユニーク)
    let presenses: string[] = []
    if (val.presense) {
      presenses = uniq(
        Object.entries(val.presense).map(([_key, value]) => value)
      ) as string[]
    }

    // オンラインユーザのリスト
    users.value = Object.entries(val.users)
      .map(([_key, value]) => value as Presense)
      .filter((e) => presenses.includes(e.uid))
      .sort((a, b) => {
        return b.connectedAt - a.connectedAt
      })
  })

  const enter = (user: User) => {
    const connectedRef = firebaseRef(db, '.info/connected')
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // online
        const userRef = firebaseRef(
          db,
          `/${workspaceId}/${meetingId}/users/${user.uid}`
        )
        set(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          connectedAt: serverTimestamp()
        })

        presenseRef = push(
          firebaseRef(db, `/${workspaceId}/${meetingId}/presense`)
        )
        set(presenseRef, user.uid)
        onDisconnect(presenseRef).remove()
      } else {
        // offline
        leave()
      }
    })
  }

  const leave = () => {
    if (presenseRef) {
      remove(presenseRef)
      presenseRef = null
    }
  }

  return {
    users,
    enter,
    leave
  }
}
