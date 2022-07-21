import { defineNuxtMiddleware } from '@nuxtjs/composition-api'

export default defineNuxtMiddleware(({ app, route, redirect }) => {
  if (!app.$currentUser.value && route.path !== '/') {
    redirect('/signin', { redirect: route.path })
  }
})
