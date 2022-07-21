<template>
  <div ref="top" style="position: sticky; z-index: 1; top: 0">
    <!-- mobile version -->
    <div v-if="$vuetify.breakpoint.xs" class="d-flex flex-column">
      <div class="d-flex align-start flex-wrap">
        <div class="flex-grow-1">
          <slot name="title"></slot>
        </div>
        <div class="d-flex align-end align-self-end flex-nowrap">
          <slot name="menu"></slot>
        </div>
      </div>
      <slot name="status"></slot>
    </div>

    <!-- tablet / pc version -->
    <div v-else>
      <div class="d-flex align-center">
        <slot name="title"></slot>
        <slot name="status"></slot>
        <slot name="menu"></slot>
      </div>
    </div>
  </div>
</template>
