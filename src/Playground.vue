<template>
    <div class="page" id="app">
        <div class="header">
            <h2>Image slider</h2>
        </div>
        <div class="content">
            <div class="ImageSliderBig">
                <div class="ImageSliderContainer">
                    <ImageSlider
                        v-model="nCurrentSliderIdx" class="ImageSlider"
                        :aImages="aImages" :fGetImgSrc="fGetImgSrc"
                        :bDisplayButtons="bDisplayButtons"
                        :bButtonsFilled="bButtonsFilled"
                        :bHoverZoomEnabled="bHoverZoomEnabled"
                        :bPinchZoomEnabled="bPinchZoomEnabled"
                    />
                    <ImageSliderPagination
                        v-model="nCurrentSliderIdx"
                        class="ImageSliderDotPagination"
                        :nCountItems="aImages.length"
                        :sAlign="sAlign"
                    />
                    <ImageSliderPagination
                        v-model="nCurrentSliderIdx"
                        class="ImageSliderImagePagination"
                        :aImages="aImages"
                        :fGetImgSrc="fGetImgSrc"
                        :bShowFade="bShowFade"
                    />
                </div>

                <div class="description">
                    <h4>Слайдер изображений</h4>
                    Для слайдера изображений можно задать любую высоту и ширину, закрепив за ним класс
                    <li>
                        @value (v-model) - индекс отображаемого изображения
                    </li>
                    <li>
                        @aImages - массив изображений
                    </li>
                    <li>
                        @fGetImgSrc - функция получения изображения
                    </li>
                    <li>
                        <input type="checkbox" v-model="bDisplayButtons">
                        @bDisplayButtons - включает и отключает кнопки навигации
                    </li>
                    <li>
                        <input type="checkbox" v-model="bButtonsFilled">
                        @bButtonsFilled - включает и отключает фон на кнопках
                    </li>
                    <li>
                        <input type="checkbox" v-model="bPinchZoomEnabled">
                        @bPinchZoomEnabled - включает и отключает зум пальцами и двойным тапом
                    </li>
                    <li>
                        <input type="checkbox" v-model="bHoverZoomEnabled">
                        @bHoverZoomEnabled - включает и отключает зум при наведении мыши <br> (работает только с большими
                        изображениями)
                    </li>
                    <li>
                        @onClickImg - Функция - отрабатывает клик по картинке
                    </li>

                    <h4>Слайдер пагинация (точки)</h4>
                    Для корректной работы необходимо указать высоту компонента. Ширина будет рассчитана автоматически, а
                    позиционирование определяется в @prop.
                    Пагинация точками будет работать, если в компонент не передавать изображений, но указать их количество.
                    <li>
                        @value (v-model) - индекс отображаемого изображения
                    </li>
                    <li>
                        @nCountItems - количество изображений и точек в пагинации
                    </li>
                    <li>
                        @sAlign - Позицианирование пагинации left | center | right
                        <select v-model="sAlign" style="margin-left: 10px;">
                            <option v-for="(option, idx) in aAlignPaginationOptions" :key="idx">{{ option }}</option>
                        </select>
                    </li>

                    <h4>Слайдер пагинация (изображения)</h4>
                    Пагинация изображениями будет работать, если в компонент передан массив изображений
                    <li>
                        @value (v-model) - индекс отображаемого изображения
                    </li>
                    <li>
                        @aImages - массив изображений
                    </li>
                    <li>
                        @fGetImgSrc - функция получения изображения
                    </li>
                    <li>
                        <input type="checkbox" v-model="bShowFade">
                        @bShowFade - включает и отключает размытие в конце пагинации
                    </li>
                </div>
            </div>
            <pre class="code-example">
            <code data-lang="html">
            <span>&lt;!-- Слайдер изображений --></span>
            <span>&lt;image-switch</span>
            <span>  v-model="nCurrentSliderIdx"</span>
            <span>  class="ImageSwitch"</span>
            <span>  :aImages="aImages"</span>
            <span>  :fGetImgSrc="fGetImgSrc"</span>
            <span>  :bDisplayButtons="bDisplayButtons"</span>
            <span>  :bButtonsFilled="bButtonsFilled"</span>
            <span>  bHoverZoomEnabled="true"</span>
            <span>/></span>
            </code>

            <code data-lang="html">
            <span>&lt;!-- Пагинация точками --></span>
            <span>&lt;image-switch-pagination</span>
            <span>  v-model="nCurrentSliderIdx"</span>
            <span>  class="ImageSwitchDotPagination"</span>
            <span>  :nCountItems="aImages.length"</span>
            <span>  :sAlign="sAlign"</span>
            <span>/></span>
            </code>

            <code data-lang="html">
            <span>&lt;!-- Пагинация изображениями --></span>
            <span>&lt;image-switch-pagination</span>
            <span>  v-model="nCurrentSliderIdx"</span>
            <span>  class="ImageSwitchImagePagination"</span>
            <span>  :aImages="aImages"</span>
            <span>  :fGetImgSrc="fGetImgSrc"</span>
            <span>  :bShowFade="bShowFade"</span>
            <span>/></span>
            </code>
        </pre>
            <div class="grid-example">
                <ul class="grid-items">
                    <li class="one-item" v-for="(item, idx) in ixItemGrid" :key="idx">
                        <ImageSlider
                            v-model="ixItemGrid[idx]"
                            class="gridImageSlider"
                            :aImages="aImages"
                            :fGetImgSrc="fGetImgSrc"
                            :bDisplayButtons="false"
                            :bHoverZoomEnabled="false"
                        />
                        <ImageSliderPagination
                            v-model="ixItemGrid[idx]"
                            class="gridImgPagination"
                            :nCountItems="aImages.length"
                            sAlign="center"
                        />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import image_slider from './components/image_slider/image_slider.vue'
import image_slider_pagination from './components/image_slider_pagination/image_slider_pagination.vue'

@Component({
    components: {
        'ImageSlider': image_slider,
        'ImageSliderPagination': image_slider_pagination
    }
})
export default class Playground extends Vue {
    aImages: string[] = [
        'https://popugai.info/wp-content/uploads/photo-gallery/volnistye/volnistyi.jpg',
        'https://popugai.info/wp-content/uploads/photo-gallery/volnistye/2770601770_4478371bb0_b.jpg',
        'https://animals.pibig.info/uploads/posts/2023-04/1680686054_animals-pibig-info-p-volnistii-popugai-malchik-zhivotnie-vkonta-11.jpg',
        'https://animals.pibig.info/uploads/posts/2023-04/1681387920_animals-pibig-info-p-volnistii-popugai-golubogo-tsveta-zhivotni-1.jpg',
        'https://krasivosti.pro/uploads/posts/2021-04/1618651900_1-krasivosti_pro-p-volnistii-popugai-belii-ptitsi-krasivo-fot-1.jpg',
        'https://www.aqua-shop.ru/images/goods/Z1a21.jpg',
        'https://for-pet.ru/wp-content/uploads/hnfghngg445234.jpg',
    ]

    nCurrentSliderIdx: number = 0;
    bDisplayButtons: boolean = true;
    bButtonsFilled: boolean = true;
    bPinchZoomEnabled: boolean = true;
    bHoverZoomEnabled: boolean = true;
    sAlign: string = 'center';
    aAlignPaginationOptions: string[] = ['left', 'center', 'right']
    bShowFade: boolean = true;

    ixItemGrid: Record<number, number> = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
    }

    fGetImgSrc(img: string) {
        return img
    }
}
</script>

<style lang="scss">
.page {
    display: flex;
    flex-direction: column;

    .content {
        max-width: 1400px;
        margin: auto;
    }
}

.header {
    width: 100%;
    max-height: 40px;
    text-align: center;
}

.ImageSliderBig {
    display: flex;

    @media (max-width: 1080px) {
        flex-direction: column;
    }
}

.ImageSliderContainer {
    width: 450px;

    @media (max-width: 1080px) {
        display: flex;
        flex-direction: column;
        margin: auto;
    }

    @media (max-width: 1080px) {
        display: flex;
        flex-direction: column;
        margin: auto;
    }

    .ImageSlider {
        width: 450px;
        height: 700px;
    }

    .ImageSliderDotPagination {
        height: 8px;
        width: 100%;
        margin-top: 10px;
    }

    .ImageSliderImagePagination {
        height: 100px;
        width: 100%;
        margin-top: 20px;
    }
}

.description {
    margin-left: 20px;
    margin-right: 200px;
    list-style: none;

    h4 {
        margin-top: 10px;
    }

    li {
        list-style: none;
        padding-bottom: 10px;
    }

    @media (max-width: 1080px) {
        margin-top: 20px;
        list-style: none;
        margin-right: 20px;
    }
}

.code-example {
    display: flex;
    flex-wrap: wrap;
    margin: 20px 0;
    background-color: #f7f7f9;
}

.grid-example {
    display: flex;
    padding-bottom: 40px;

    .grid-items {
        margin: auto;
        display: flex;
        flex-wrap: wrap;
        max-width: 990px;
        padding: 0;

        .one-item {
            list-style: none;
            margin: 20px auto;
            position: relative;
            width: 200px;
            height: 200px;
            padding: 0 20px 0 20px;

            @media (max-width: 790px) {
                width: 150px;
            }

            .gridImageSlider {
                width: 100%;
                height: 100%;
            }

            .gridImgPagination {
                height: 8px;
            }
        }
    }
}
</style>
