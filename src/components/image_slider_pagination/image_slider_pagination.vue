<script lang="ts" src="./image_slider_pagination.ts"></script>

<style lang="scss" scoped>
    @import './image_slider_pagination.scss';
</style>

<template>
    <div class="image-slider-pagination" 
        ref="imageSliderPagination" 
        draggable="false"
        :class="{
            'content-left': sAlign === 'left',
            'content-center': sAlign === 'center',
            'content-right': sAlign === 'right',
        }"
    >
        <div v-if="isDotPagination"
            class="dot-pagination-wrapper"
            draggable="false"
        >
            <div class="dot-pagination"
                :style="{
                    width: `${nPaginationWidth}px`
                }"
            >
                <ul class="list-circles"
                    :style="{
                        'padding': `${nCirclePadding}px`,
                        'transform': `translateX(${nTransform}px)`,
                    }"
                >
                    <li class="circle" 
                        v-for="(circle, idx) in nCountImagesLocal" :key="idx"
                        :class="{
                            'circle-active': idx === idxCurrentSlide,
                        }"
                        :style="{
                            'width': `${nCircleSize}px`,
                            'margin-left': idx === 0 ? 0 : `${nCirclePadding}px`
                        }"
                    ></li>
                </ul>
            </div>
        </div>
        <div v-else class="image-pagination-wrapper">

            <div class="image-pagination" ref="scroll">
                <ul class="list-images">
                    <li class="image-container"
                        v-for="(img, idx) in aImages"
                        @click="fSelectCard(idx, $event)"
                        :key="idx"
                        :id="`image-${idx}`"
                        :class="{
                            'is-selected': idx === idxCurrentSlide,
                        }"
                        :style="{
                            'width': `${nImageSize}px`,
                            'height': `${nImageSize}px`,
                            'margin-left': idx === 0 ? 0 : `${nImageSize / 10}px`
                        }"
                    >
                        <img class="image" 
                            draggable="false"
                            :src="fGetImgSrcLocal(img)"
                            :alt="img.alt"
                        >
                    </li>
                </ul>
            </div>
            <div class="fade"
                v-if="bShowFadeLocal"
                :style="{
                    'width': `${nSlideDistance / 3}px`,
                }"
            />
        </div>
    </div>
</template>
