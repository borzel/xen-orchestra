import { useBreakpoints, useColorMode } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export const useUiStore = defineStore('ui', () => {
  const currentHostOpaqueRef = ref()
  const currentSrOpaqueRef = ref()

  const { store: colorMode } = useColorMode({ initialValue: 'dark' })

  const { desktop: isDesktop } = useBreakpoints({
    desktop: 1024,
  })

  const isMobile = computed(() => !isDesktop.value)

  const router = useRouter()
  const route = useRoute()

  const hasUi = computed<boolean>({
    get: () => route.query.ui !== '0',
    set: (value: boolean) => {
      void router.replace({ query: { ui: value ? undefined : '0' } })
    },
  })

  return {
    colorMode,
    currentHostOpaqueRef,
    currentSrOpaqueRef,
    isDesktop,
    isMobile,
    hasUi,
  }
})
