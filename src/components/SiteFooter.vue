<template>
  <v-footer padless color="lighten-5" class="justify-center py-8">
    <v-row justify="center" no-gutters>
      <v-btn
        v-for="link in [
          { label: 'プライバシー', href: '/privacy' },
          { label: '運営会社', href: 'https://www.techtalk.jp/' },
          {
            label: 'GitHub',
            href: 'https://github.com/coji/leancoffee.in'
          }
        ]"
        :key="link.label"
        color="lighten-2"
        text
        rounded
        target="_blank"
        :href="link.href"
      >
        {{ link.label }}
      </v-btn>
    </v-row>
  </v-footer>
</template>
