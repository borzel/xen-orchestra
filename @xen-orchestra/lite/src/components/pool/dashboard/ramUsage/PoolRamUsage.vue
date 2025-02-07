<template>
  <UiCard class="linear-chart" :color="hasError ? 'error' : undefined">
    <UiCardTitle>{{ $t('pool-ram-usage') }}</UiCardTitle>
    <UiCardTitle :level="UiCardTitleLevel.Subtitle">
      {{ $t('last-week') }}
    </UiCardTitle>
    <NoDataError v-if="hasError" />
    <UiCardSpinner v-else-if="isLoading" />
    <LinearChart v-else :data="data" :max-value="customMaxValue" :value-formatter="customValueFormatter" />
    <SizeStatsSummary :size="currentData.size" :usage="currentData.usage" />
  </UiCard>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, inject } from 'vue'
import { formatSize } from '@/libs/utils'
import { IK_HOST_LAST_WEEK_STATS } from '@/types/injection-keys'
import type { LinearChartData } from '@/types/chart'
import NoDataError from '@/components/NoDataError.vue'
import { RRD_STEP_FROM_STRING } from '@/libs/xapi-stats'
import SizeStatsSummary from '@/components/ui/SizeStatsSummary.vue'
import { sumBy } from 'lodash-es'
import UiCard from '@/components/ui/UiCard.vue'
import UiCardTitle from '@/components/ui/UiCardTitle.vue'
import UiCardSpinner from '@/components/ui/UiCardSpinner.vue'
import { UiCardTitleLevel } from '@/types/enums'
import { useHostCollection } from '@/stores/xen-api/host.store'
import { useHostMetricsCollection } from '@/stores/xen-api/host-metrics.store'
import { useI18n } from 'vue-i18n'

const LinearChart = defineAsyncComponent(() => import('@/components/charts/LinearChart.vue'))

const { runningHosts, isFetching, hasError } = useHostCollection()
const { getHostMemory } = useHostMetricsCollection()

const { t } = useI18n()

const hostLastWeekStats = inject(IK_HOST_LAST_WEEK_STATS)

const customMaxValue = computed(() => sumBy(runningHosts.value, host => getHostMemory(host)?.size ?? 0))

const currentData = computed(() => {
  let size = 0
  let usage = 0
  runningHosts.value.forEach(host => {
    const hostMemory = getHostMemory(host)
    size += hostMemory?.size ?? 0
    usage += hostMemory?.usage ?? 0
  })
  return { size, usage }
})

const data = computed<LinearChartData>(() => {
  const timestampStart = hostLastWeekStats?.timestampStart?.value
  const stats = hostLastWeekStats?.stats?.value

  if (timestampStart === undefined || stats == null) {
    return []
  }

  const result = new Map<number, { timestamp: number; value: number }>()

  stats.forEach(({ stats }) => {
    if (stats?.memory === undefined) {
      return
    }

    const memoryFree = stats.memoryFree
    const memoryUsage = stats.memory.map((memory, index) => memory - memoryFree[index])

    memoryUsage.forEach((value, hourIndex) => {
      const timestamp = (timestampStart + hourIndex * RRD_STEP_FROM_STRING.hours) * 1000

      result.set(timestamp, {
        timestamp,
        value: (result.get(timestamp)?.value ?? 0) + memoryUsage[hourIndex],
      })
    })
  })

  return [
    {
      label: t('stacked-ram-usage'),
      data: Array.from(result.values()),
    },
  ]
})

const isStatFetched = computed(() => {
  const stats = hostLastWeekStats?.stats?.value
  if (stats === undefined) {
    return false
  }

  return stats.every(host => {
    const hostStats = host.stats
    return hostStats != null && hostStats.memory.length === data.value[0].data.length
  })
})

const isLoading = computed(() => (isFetching.value && !hasError.value) || !isStatFetched.value)

const customValueFormatter = (value: number) => String(formatSize(value))
</script>
