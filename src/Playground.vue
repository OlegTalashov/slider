<template>
    <div id="app">
        <div class="header">
            <h2>Image slider</h2>
        </div>
        <div class="content">
            <div class="slider-container">
                <ImageSlider
                    class="ImageSlider"
                    v-model="idxImage"
                    :aImages="aImages"
                    :fGetImgSrc="fGetImgSrc"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import image_slider from './components/image_slider/image_slider.vue'

@Component({
    components: {
        'ImageSlider': image_slider
    }
})
export default class Playground extends Vue {
    aImages: string[] = [
        'https://images-cdn.ubuy.co.in/633feb8e47bce417100ba4bf-sexy-hot-busty-breasts-model-woman-babe.jpg',
        // 'https://i.etsystatic.com/35054921/r/il/c08df2/3873830088/il_570xN.3873830088_2jzd.jpg'
    ]

    idxImage: number = 0;

    fGetImgSrc(img: string){
        return img
    }
}
</script>

<style lang="scss">
    .header{
        width: 100%;
        max-height: 40px;
        text-align: center;
    }
    .content{
        display: flex;
        .slider-container{
            width: 500px;
            margin: 30px auto 0 auto;
            .ImageSlider{
                height: 600px;
                width: 100%;
            }
        }
    }
</style>
