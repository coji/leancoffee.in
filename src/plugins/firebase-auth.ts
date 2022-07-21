import {
  defineNuxtPlugin,
  globalPlugin,
  onGlobalSetup,
  onUnmounted,
  provide,
  ref
} from '@nuxtjs/composition-api'
import { getAuth, onAuthStateChanged, Unsubscribe } from 'firebase/auth'
import { firebaseApp } from '~/plugins/firebase'
import { CurrentUser } from '~/compositions/useCurrentUser'
import { User } from '~/interfaces/user'

export default defineNuxtPlugin(async (context, inject) => {
  const currentUser = ref<User | null>(null)
  inject('currentUser', currentUser) // inject to nuxt context

  const auth = getAuth(firebaseApp)
  const unsubscribe: Unsubscribe | null = await new Promise((resolve) => {
    if (process.server) {
      resolve(null)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // signin
        currentUser.value = {
          uid: user.uid,
          photoURL: user.photoURL,
          displayName: user.displayName,
          email: user.email
        }
      } else {
        // sign out
        currentUser.value = null
        // context.redirect({ name: 'index' }) // ログアウトしたのでトップページに戻す
      }
      resolve(unsubscribe)
    })
  })

  globalPlugin(context, inject)
  onGlobalSetup(() => {
    provide(CurrentUser, currentUser)
    if (unsubscribe) onUnmounted(unsubscribe)
  })
})
