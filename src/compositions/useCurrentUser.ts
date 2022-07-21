import { computed, inject, InjectionKey, Ref } from '@nuxtjs/composition-api'
import {
  getAuth,
  signInWithRedirect,
  signOut as firebaseSignOut,
  GoogleAuthProvider
} from 'firebase/auth'
import { goOffline, getDatabase } from 'firebase/database'
import { firebaseApp } from '~/plugins/firebase'
import { User } from '~/interfaces/user'

export const CurrentUser: InjectionKey<Ref<User | null>> = Symbol('CurrentUser')

export const useCurrentUser = () => {
  const auth = getAuth(firebaseApp)
  auth.languageCode = 'ja'

  const bareCurrentUser = inject(CurrentUser)
  if (!bareCurrentUser) {
    throw new Error('CurrentUser is not provided.')
  }

  // treat for useFetch hydration...
  const currentUser = computed({
    get: () => bareCurrentUser.value,
    set: () => {}
  })

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithRedirect(auth, provider)
  }

  const signOut = async () => {
    goOffline(getDatabase(firebaseApp))
    await firebaseSignOut(auth)
  }

  return {
    currentUser,
    signIn,
    signOut
  }
}
