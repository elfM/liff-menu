<template>
    <div class="flex">
      <VueDraggable
        class="flex flex-col gap-2 p-4 w-300px h-300px m-auto bg-gray-500/5 rounded overflow-auto"
        v-model="list1"
        :animation="150"
        ghostClass="ghost"
        group="people"
        @update="onUpdate"
        @add="onAdd"
        @remove="remove"
      >
        <div
          v-for="item in list1"
          :key="item.id"
          class="cursor-move h-30 bg-gray-500/5 rounded p-3"
        >
          {{ item.name }}
        </div>
      </VueDraggable>
      <VueDraggable
        class="flex flex-col gap-2 p-4 w-300px h-300px m-auto bg-gray-500/5 rounded overflow-auto"
        v-model="list2"
        :animation="150"
        group="people"
        ghostClass="ghost"
        @update="onUpdate"
        @add="onAdd"
        @remove="remove"
      >
        <div
          v-for="item in list2"
          :key="item.id"
          class="cursor-move h-30 bg-gray-500/5 rounded p-3"
        >
          {{ item.name }}
        </div>
      </VueDraggable>
    </div>
    <div class="flex justify-between">
      <preview-list :list="list1" />
      <preview-list :list="list2" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'

  const list1 = ref([
    {
      name: 'Joao',
      id: '1'
    },
    {
      name: 'Jean',
      id: '2'
    },
    {
      name: 'Johanna',
      id: '3'
    },
    {
      name: 'Juan',
      id: '4'
    }
  ])
  const list2 = ref(
    list1.value.map(item => ({
      name: `${item.name}-2`,
      id: `${item.id}-2`
    }))
  )
  function onUpdate() {
    console.log('update')
  }
  function onAdd() {
    console.log('add')
  }
  function remove() {
    console.log('remove')
  }
  </script>

  <style scoped>
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .p-3 {
    padding: 0.75rem;
  }
  .w-300px {
    width: 300px;
  }
  .h-300px {
    height: 300px;
  }
  .h-30 {
    height: 7.5rem;
  }
  .m-auto {
    margin: auto;
  }
  .bg-gray-500\/5 {
    background-color: rgba(107, 114, 128, 0.05);
  }
  .rounded {
    border-radius: 0.25rem;
  }
  .overflow-auto {
    overflow: auto;
  }
  .cursor-move {
    cursor: move;
  }
  .justify-between {
    justify-content: space-between;
  }
  :deep(.ghost) {
    opacity: 0.4;
    background-color: rgba(107, 114, 128, 0.15);
  }
  </style>
