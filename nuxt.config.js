/** @type {import('@nuxt/types').NuxtOptions} */

import fs from 'fs'
import path from 'path'

const config = {
  srcDir: './src',
  ssr: false,
  head: {
    //    titleTemplate: '%s - Lean Coffee',
    title: 'Lean Coffee',
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover'
      },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: 'https://twemoji.maxcdn.com/v/13.0.2/72x72/2615.png'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Noto+Sans+JP&display=swap'
      }
    ]
  },
  loadingIndicator: {
    name: 'cube-grid',
    color: '#4E342E',
    background: 'white'
  },
  css: [],
  plugins: [
    '~/plugins/firebase',
    '~/plugins/firebase-auth',
    '~/plugins/revision-check',
    '~/plugins/clipboard-copy.client'
  ],
  components: true,
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/stylelint-module',
    '@nuxtjs/vuetify',
    '@nuxtjs/composition-api/module'
  ],
  modules: ['@nuxtjs/axios', '@nuxtjs/dayjs', '@nuxtjs/markdownit'],
  axios: {
    https: true
  },
  dayjs: {
    locales: ['ja'],
    defaultLocale: 'ja',
    defaultTimeZone: 'Asia/Tokyo',
    plugins: ['utc', 'timezone', 'localizedFormat', 'relativeTime']
  },
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    defaultAssets: {
      font: {
        family: 'Noto Sans JP'
      }
    },
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#4E342E',
          accent: '#b0bec5',
          secondary: '#ff8f00',
          info: '#26a69a',
          warning: '#ffc107',
          error: '#dd2c00',
          success: '#00e676'
        }
      }
    }
  },
  markdownit: {
    runtime: true,
    preset: 'default',
    linkify: true,
    breaks: true,
    use: ['markdown-it-div', 'markdown-it-attrs']
  },
  build: {
    extend(config, { isClient }) {
      if (isClient) {
        config.devtool = 'source-map'
      }
    }
  },
  server: {
    port: 3000,
    timing: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'config/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'config/localhost.pem'))
    }
  }
}

export default config
