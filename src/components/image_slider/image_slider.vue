<script lang="ts" src="./image_slider.ts"></script>

<style lang="scss" scoped>
@import './image_slider.scss';
</style>

<template>
    <div class="image-slider" ref="imageSlider" draggable="false">
        <div class="img-container">
            <ul
                class="img-list"
                draggable="false"
                :style="{
                    transform: `translateX(${nTransform}px)`,
                    transition: `transform ${nSwipeTransition}s ease 0s`,
                }"
            >
                <li
                    class="img-box"
                    v-for="(img, idx) in aImages"
                    :key="idx"
                    draggable="false"
                    :style="{
                        width: nSlideWidth ? `${nSlideWidth}px` : 'auto',
                        height: '100%',
                    }"
                >
                    <div
                        class="zoom"
                        draggable="false"
                        :id="`zoom-${idx}`"
                        @touchstart="fTouchStartHandler"
                        @touchmove="fTouchMoveHandler"
                        @touchend="fTouchEndHandler"
                        @touchcancel="fTouchEndHandler"
                        @mousedown="fMouseDownHendler"
                        @mousemove="fMoveZoomImage($event, img)"
                        @mouseleave="fMouseLeaveHandler"
                        :style="{ transform: sTransform }"
                        :class="{ 'pinch-transition': !isStopAnimation }"
                    >
                        <img
                            class="img"
                            draggable="false"
                            @contextmenu="$event.stopPropagation()"
                            @mouseover="fMouseOverHandler($event, img)"
                            :src="fGetImgSrcLocal(img)"
                            :alt="fGetAlt(img)"
                            :style="{
                                maxWidth: 'auto',
                                ...vImgStyle,
                            }"
                            :loading="idx === 0 ? 'eager' : 'lazy'"
                            :decoding="idx === 0 ? 'sync' : 'async'"
                        />
                    </div>
                </li>
            </ul>

            <button v-if="bDisplayButtons && aImages.length > 1" class="btn btn-left" @click.stop="fShowPreviousImg">
                <i
                    class="arrow arrow-position-left"
                    :class="{
                        filled: bButtonsFilled,
                        'no-events': nSwipeStartX,
                    }"
                    aria-label="Предыдущее изображение"
                />
            </button>
            <button v-if="bDisplayButtons && aImages.length > 1" class="btn btn-right" @click.stop="fShowNextImg">
                <i
                    class="arrow arrow-position-right"
                    :class="{
                        filled: bButtonsFilled,
                        'no-events': nSwipeStartX,
                    }"
                    aria-label="Следующее изображение"
                />
            </button>
        </div>
    </div>
</template>
