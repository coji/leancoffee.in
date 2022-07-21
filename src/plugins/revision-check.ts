import { defineNuxtPlugin, onGlobalSetup } from '@nuxtjs/composition-api'
import md5 from 'md5'

export default defineNuxtPlugin(({ $axios }) => {
  let revisionId = ''

  onGlobalSetup(() => {
    window.setInterval(async () => {
      const ret = await $axios.$get('/')
      const check = md5(ret)

      if (revisionId !== check) {
        if (revisionId === '') {
          revisionId = check // 初回
        } else {
          window.location.reload() // 更新されてるのでリロード
        }
      }
    }, 1000 * 60) // 1分に1回チェック
  })
})
