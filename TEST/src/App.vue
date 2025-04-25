<script setup lang="ts">
import { ref } from 'vue'
import Svg from './Svg.vue'
import Three from './Three.vue'
const choose = ref(1)
</script>

<template>
    <div class="flex justify-center items-center h-screen">
        <input type="radio" id="svg" value="1" v-model="choose" />
        <label for="svg" class="ml-2">SVG</label>
        <span style="margin: 0 16px">|</span>

        <input type="radio" id="three" value="2" v-model="choose" class="ml-4" />
        <label for="three">Three</label>
    </div>
    <hr />
    <Svg v-if="choose == 1" />
    <Three v-if="choose == 2" />
</template>
