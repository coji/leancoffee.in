<template>
  <div>
    <v-navigation-drawer v-model="drawer" temporary app>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar flat color="brown lighten-5">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>
        <nuxt-link
          to="/"
          class="text-decoration-none primary--text"
          style="font-family: serif"
        >
          Lean Coffee
          <v-img
            class="d-inline-block"
            width="20"
            src="https://twemoji.maxcdn.com/v/13.0.2/72x72/2615.png"
          />
        </nuxt-link>
      </v-toolbar-title>
      <v-spacer />

      <client-only>
        <v-slide-y-transition>
          <v-menu v-if="currentUser" offset-y bottom>
            <template #activator="{ on }">
              <v-btn icon v-on="on">
                <v-avatar size="40">
                  <v-img :src="currentUser && currentUser.photoURL" />
                </v-avatar>
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                href="https://myaccount.google.com/personal-info"
                target="_blank"
              >
                <v-list-item-icon>
                  <v-icon color="primary"> mdi-google </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ currentUser.displayName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ currentUser.email }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon color="primary">mdi-account-cog-outline</v-icon>
                </v-list-item-action>
              </v-list-item>
              <v-divider />
              <v-list-item @click="signOut">
                <v-list-item-content>
                  <v-list-item-title> サインアウト </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-slide-y-transition>
      </client-only>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useRouter } from '@nuxtjs/composition-api'
import { useCurrentUser } from '~/compositions/useCurrentUser'

export default defineComponent({
  setup() {
    const { currentUser, signOut: signOutUser } = useCurrentUser()
    const router = useRouter()
    const drawer = ref(false)
    const items = ref([
      {
        icon: 'mdi-application',
        title: 'Top',
        to: '/'
      },
      {
        icon: 'mdi-view-list-outline',
        title: 'デモ',
        to: '/techtalk/demo'
      }
    ])

    const signOut = async () => {
      router.push('/')
      await signOutUser()
    }

    return {
      drawer,
      items,
      currentUser,
      signOut
    }
  }
})
</script>
