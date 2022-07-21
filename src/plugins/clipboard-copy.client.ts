import { defineNuxtPlugin } from '@nuxtjs/composition-api'
import copy from 'clipboard-copy'

export default defineNuxtPlugin((_context, inject) => {
  inject('copyText', copy)
})

declare module '@nuxt/types' {
  interface Context {
    $copyText(text: string): Promise<void>
  }
  interface NuxtAppOptions {
    $copyText(text: string): Promise<void>
  }
}
