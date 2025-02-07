<template>
  <UiModal @submit.prevent="handleSubmit">
    <FormModalLayout :icon="faDisplay">
      <template #title>
        {{ $t('export-n-vms', { n: vmRefs.length }) }}
      </template>

      <FormInputWrapper
        light
        learn-more-url="https://xcp-ng.org/blog/2018/12/19/zstd-compression-for-xcp-ng/"
        :label="$t('select-compression')"
      >
        <FormSelect v-model="compressionType">
          <option
            v-for="key in Object.keys(VM_COMPRESSION_TYPE)"
            :key="key"
            :value="VM_COMPRESSION_TYPE[key as keyof typeof VM_COMPRESSION_TYPE]"
          >
            {{ $t(key.toLowerCase()) }}
          </option>
        </FormSelect>
      </FormInputWrapper>

      <template #buttons>
        <ModalDeclineButton />
        <ModalApproveButton>
          {{ $t('export-n-vms', { n: vmRefs.length }) }}
        </ModalApproveButton>
      </template>
    </FormModalLayout>
  </UiModal>
</template>

<script lang="ts" setup>
import { faDisplay } from '@fortawesome/free-solid-svg-icons'
import { inject, ref } from 'vue'

import FormInputWrapper from '@/components/form/FormInputWrapper.vue'
import FormSelect from '@/components/form/FormSelect.vue'
import FormModalLayout from '@/components/ui/modals/layouts/FormModalLayout.vue'
import ModalApproveButton from '@/components/ui/modals/ModalApproveButton.vue'
import ModalDeclineButton from '@/components/ui/modals/ModalDeclineButton.vue'
import UiModal from '@/components/ui/modals/UiModal.vue'
import { IK_MODAL } from '@/types/injection-keys'
import { useXenApiStore } from '@/stores/xen-api.store'
import { VM_COMPRESSION_TYPE } from '@/libs/xen-api/xen-api.enums'

import type { XenApiVm } from '@/libs/xen-api/xen-api.types'

const props = defineProps<{
  vmRefs: XenApiVm['$ref'][]
}>()

const modal = inject(IK_MODAL)!

const compressionType = ref(VM_COMPRESSION_TYPE.DISABLED)

const handleSubmit = () => {
  const xenApi = useXenApiStore().getXapi()
  xenApi.vm.export(props.vmRefs, compressionType.value)
  modal.approve()
}
</script>
