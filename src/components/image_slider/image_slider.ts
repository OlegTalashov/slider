import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';

const DOUBLE_TAP_INTERVAL_MS = 500 // Интервал для срабатывания двойного тапа
const DOUBLE_TAP_SCALE = 3.2 // Насколько приближать блок при двойном тапе
const MAX_SCALE = 3.2 // Максимальное допустимое приближение
const SCALE_FACTOR = 1 // Коэффицент изменения размера при зуме

/**
 * Компонент image_switch принимает
 * @ value - Индекс текущего изображения (v-model)
 * @ aImages - Массив изображений (S3ItemImgIDsIWithAlt)
 * @ vImgStyle - Стили для картинок если нужно дополнительные прокинуть напрямую в картинку
 * @ fGetImgSrc - Функция получения изображения
 * @ bDisplayButtons - Флаг отображения кнопок
 * @ bButtonsFilled - Флаг - кнопки с бэкграундом
 * @ bPinchZoomEnabled - Флаг - зум пальцами
 * @ bHoverZoomEnabled -  Флаг - зум при наведении мыши (работает только с большими изображениями)
 * @ onClickImg -  Функция - отрабатывает по клику на картинку
 */

@Component
export default class image_slider extends Vue {
    /** Индекс текущего изображения (v-model) */
    @Prop({ type: Number, default: 0 }) value!: number;
    /** Массив изображений */
    @Prop({ type: Array, required: true }) aImages!: string[];
    /** Стили для картинок если нужно дополнительные прокинуть напрямую в картинку */
    @Prop({ type: Object, default: () => {} }) vImgStyle!: object;
    /** Функция получения изображения */
    @Prop({ type: Function, required: true }) fGetImgSrc!: (img: any) => string;
    /** Функция получения изображения */
    @Prop({ type: Function, default: () => '' }) fGetAlt!: (img: any) => string;
    /** Функция получения alt изображения */
    @Prop({ type: Function, required: false, default: () => '' }) fGetAltSrc!: (img: any) => string;
    /** Флаг отображения кнопок */
    @Prop({ type: Boolean, default: true }) bDisplayButtons!: boolean;
    /** Флаг - кнопки с бэкграундом */
    @Prop({ type: Boolean, default: true }) bButtonsFilled!: boolean;
    /** Флаг - зум пальцами */
    @Prop({ type: Boolean, default: false }) bPinchZoomEnabled!: boolean;
    /** Флаг - зум при наведении мыши (работает только с большими изображениями) */
    @Prop({ type: Boolean, default: false }) bHoverZoomEnabled!: boolean;
    /** Функция обработки вводимых данных пользователем */
    // @Prop({ type: Function }) onClickImg!: () => void | undefined;
    @Prop({ type: Function }) onClickImg!: () => void;

    $refs!: {
        imageSlider: HTMLDivElement,
    }

    /** Переменные приближения */
    isResize = false // Меняем ли мы размер двумя пальцами
    isStopAnimation = false // Остановить ли анимацию
    isOneTap = false // Единичный ли тап был
    nScale = 1 // Во сколько увеличили блок
    nPreviousTapTime = 0 // В какое время был сделан прошлый тап, нужно для подсчета двоного тапа
    nTapStartTime = 0 // В какое время был сделан первый тап, нужно для события по тапу на картинку
    nStartDistance = 0 // Начальное растояние между двумя пальцами
    nStartScale = 0 // Начальный scale при начале ресайза двумя пальцами
    nMiddleX = 0 // Середина между двумя пальцами, координата X
    nMiddleY = 0 // Середина между двумя пальцами, координата Y

    /** Переменные перемещения при приближении */
    isMoveScaled: boolean = false // Передвигаем ли содержимое
    nMoveX = 0 // На сколько передвинули блок по X
    nMoveY = 0 // На сколько передвинули блок по Y

    nMoveScaledStartX = 0 // Начальное положение пальца при нажатии по X
    nMoveScaledStartY = 0 // Начальное положение пальца при нажатии по Y
    nMoveScaledX = 0 // На сколько передвинули блок при первом нажатии по X
    nMoveScaledY = 0 // На сколько передвинули блок при первом нажатии по Y

    nMaxMoveDistanceX = 0 // Максимальное отклонение при передвижении по X
    nMaxMoveDistanceY = 0 // Максимальное отклонение при передвижении по Y

    /** Переменные перелистывания изображений */
    nTransform: number = 0; // Текущее положение изображений
    ixEachImgPos: Record<number, number> = {}; // Правильные положения каждого изображения по индексу
    nSwipeTransition: number = 0; // Скорость перелистывания
    nSlideWidth: number = 0; // Ширина одного слайда
    nSlideHeight: number = 0; // Высота одного слайда
    nSwipeStartX: number = 0; // Стартовая точка касания (х) при свайпе
    nSwipeStartY: number = 0; // Стартовая точка касания (y) при свайпе
    nSwipeEndX: number = 0; // Конечная точка касания (х) при свайпе
    nSwipeEndY: number = 0; // Конечная точка касания (y) при свайпе
    nMinSwipeDistance = 30; // Минимальное расстояние, чтобы засчитался свайп

    /** Функция получения изображения */
    fGetImgSrcLocal(img: any){
        return this.fGetImgSrc(img) ?? '';
    }

    /** Получить alt изорбражения */
    fGetAltLocal(alt: any){
        return this.fGetAlt(alt) ?? '';
    }

    /** Обработчик нажатия мыши */
    fMouseDownHendler(e: MouseEvent){
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.button === 0 && !this.nSwipeStartX){
            this.nTapStartTime = new Date().getTime()
            this.nSwipeStartX = e.clientX;
            this.nSwipeStartY = e.clientY;
            window.addEventListener('mouseup', this.fMouseUpHandler);
            if (this.aImages.length > 1){
                this.nSwipeTransition = 0;
                window.addEventListener('mousemove', this.fMouseMoveHandler);
            }
        }
    }

    /** Обработчик движения мыши */
    fMouseMoveHandler(e: MouseEvent){
        if (this.nSwipeStartX !== 0){
            this.fSwipeImages(e)
        }
    }

    /** Установка зума изображения при наведении мыши */
    fMouseOverHandler(e: MouseEvent, img: any){
        e.stopPropagation();
        const isHoverZoomAvailable: boolean = this.bHoverZoomEnabled
            && this.nSwipeStartX === 0
        if (isHoverZoomAvailable){
            const elImg = e.target as HTMLImageElement;
            const elParent = elImg.parentElement as HTMLElement;
            
            elParent.style.backgroundImage = `url(${this.fGetImgSrcLocal(img)})`
            elImg.style.opacity = '0';
        }
    }

    /** Передвижение зума изображения мышью */
    fMoveZoomImage(e: MouseEvent, img: any){
        const isHoverZoomAvailable: boolean = this.bHoverZoomEnabled
            && this.nSwipeStartX === 0
        if (isHoverZoomAvailable){
            this.fHoverHandler(e);
        }
    }

    /** Функция по клику на картинку */
    fClickImg(e: Event) {
        if (typeof this.onClickImg === 'function'){
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.onClickImg();
        }
    }

    /** Отключение зума изображения */
    fMouseLeaveHandler(e: MouseEvent){
        if (this.nSwipeStartX === 0){
            const elTarget = e.currentTarget as HTMLElement;
            const elImg = elTarget.firstChild as HTMLImageElement;
            elTarget.style.backgroundImage = 'unset';
            elImg.style.opacity = '1';
        }
    }

    /** Обработчик отжатия кнопки мыши */
    fMouseUpHandler(e: MouseEvent){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (this.nSwipeStartX){
            if (typeof this.onClickImg === 'function') {
                this.nSwipeEndX = e.clientX
                this.nSwipeEndY = e.clientY
                this.fTapCheck();
            }
            this.fStopSwipe(e.clientX)
        }
        window.removeEventListener('mousemove', this.fMouseMoveHandler);
        window.removeEventListener('mouseup', this.fMouseUpHandler);
    }

    /** Обработчик начала касания */
    fTouchStartHandler(e: TouchEvent){
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.nTapStartTime = new Date().getTime()
        /** Логика с включенным зумом двумя касаниями */
        if (this.bPinchZoomEnabled){
            if (e.touches.length > 1){
                this.fStartResize(e);
            } else {
                if (this.fDoubleTapCheck()) {
                    this.fDoubleTap(e)
                } else if (this.nScale !== 1){
                    this.fStartMoveScaled(e);
                } else if (this.aImages.length > 1) {
                    this.nSwipeTransition = 0;
                    this.nSwipeStartX = e.touches[0].clientX;
                    this.nSwipeStartY = e.touches[0].clientY;
                }
            }
        }
        /** Без зума работает только перелистывание */
        else if (this.aImages.length > 1) {
            this.nSwipeTransition = 0;
        }
        this.nSwipeStartX = e.touches[0].clientX;
        this.nSwipeStartY = e.touches[0].clientY;
    }

    /** Обработчик движения пальцем */
    fTouchMoveHandler(e: TouchEvent){
        /** Логика с включенным зумом двумя касаниями */
        if (this.bPinchZoomEnabled){
            if (this.isResize){
                this.fResizeHandler(e);
            }
            else if (this.isMoveScaled) {
                this.fMoveScaledHandler(e)
            }
            else if (this.nSwipeStartX !== 0){
                this.fSwipeImages(e)
            }
        }
        /** Перелистывание */
        else if (this.nSwipeStartX !== 0){
            this.fSwipeImages(e)
        }
    }

    /** Проверка единичного клика по картинке */
    fTapCheck() {
        const nNow = new Date().getTime()
        const nTapTime = nNow - this.nTapStartTime;
        const isScrollX = Math.abs(this.nSwipeStartX - this.nSwipeEndX) > 10;
        const isScrollY = Math.abs(this.nSwipeStartY - this.nSwipeEndY) > 10;
        const isMoved = isScrollX || isScrollY;

        if (nTapTime < 500 && !isMoved) {
            this.isOneTap = true;
            if (this.bPinchZoomEnabled) {
                setTimeout(() => {
                    if (this.isOneTap&&this.nScale === 1){
                        this.onClickImg();
                    }
                }, 500);
            } else {
                this.onClickImg();
            }
        }
    }

    /** Обработчик окончания касания */
    fTouchEndHandler(e: TouchEvent){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (this.nSwipeStartX&&this.nScale === 1){
            if (typeof this.onClickImg === 'function') {
                this.nSwipeEndX = e.changedTouches[0].clientX
                this.nSwipeEndY = e.changedTouches[0].clientY
                
                this.fTapCheck();
            }
            const nCurrentClientX: number = e.changedTouches[0].clientX;
            this.fStopSwipe(nCurrentClientX)
        }
        this.isMoveScaled = false;
        this.isResize = false;
    }

    /** Движение изображений при свайпе */
    fSwipeImages(e: TouchEvent | MouseEvent){
        let event;
        let nCurrentClientX: number;
        const isTouchEvent = e.type === 'touchmove';

        if (isTouchEvent){
            event = e as TouchEvent;
            nCurrentClientX = event.changedTouches[0].clientX;
            if (Math.abs(nCurrentClientX - this.nSwipeStartX) > 10){
                this.nPreviousTapTime = 0;
            }
        } else {
            event = e as MouseEvent;
            nCurrentClientX = event.clientX;
        }

        const nEndPosX = this.ixEachImgPos[this.aImages.length - 1];
        const nMaxWhiteSpace = this.nSlideWidth / 3;
        const nMoveX = this.ixEachImgPos[this.idxCurrentSlide] + (nCurrentClientX - this.nSwipeStartX);

        if (this.nTransform < nMaxWhiteSpace && this.nTransform > nEndPosX - nMaxWhiteSpace && this.nScale === 1) {
            this.nTransform = nMoveX;
        }
    }

    /** Обработчик окончания свайпа */
    fStopSwipe(nCurrentClientX: number){
        let nNewIdx = this.idxCurrentSlide;
        /** Последний возможный индекс */
        const nLastIdx = this.aImages.length - 1;
        /** Дистанция свайпа в пискелях */
        const nSwipeDistance = nCurrentClientX - this.nSwipeStartX;
        /** Флаг удачного свайпа */
        const bSwipe = Math.abs(nSwipeDistance) > this.nMinSwipeDistance;
        const nSwipeCoef = Math.abs(Math.round(nSwipeDistance / this.nSlideWidth));
        const nSwipeDistanceIdx = nSwipeCoef ? nSwipeCoef : 1;

        if (bSwipe && nSwipeDistance < 0){
            nNewIdx = this.idxCurrentSlide < nLastIdx
                ? this.idxCurrentSlide + nSwipeDistanceIdx
                : this.idxCurrentSlide
        }
        else if (bSwipe && nSwipeDistance > 0){
            nNewIdx = this.idxCurrentSlide > 0
                ? this.idxCurrentSlide - nSwipeDistanceIdx
                : this.idxCurrentSlide
        }

        if (nNewIdx < 0) nNewIdx = 0;
        if (nNewIdx > nLastIdx) nNewIdx = nLastIdx;

        this.nSwipeTransition = 0.2;
        this.fSwipe(nNewIdx)
        this.nSwipeStartX = 0;
        this.nSwipeStartY = 0;
    }

    /** Перелистнуть изображение по индексу */
    fSwipe(idx: number){
        this.idxCurrentSlide = idx;
        this.nTransform = this.ixEachImgPos[idx];
        this.fCancelScale();
    }

    /** Обработыик наведения мыши для зума */
    fHoverHandler(e: MouseEvent){
        const elTarget = e.currentTarget as HTMLElement;
        const elImg = elTarget.firstChild as HTMLImageElement;

        const nPosX = (e.offsetX / elTarget.offsetWidth) * 100;
        const nPosY = (e.offsetY / elTarget.offsetHeight) * 100;

        elImg.style.opacity = '0'
        elTarget.style.backgroundPosition =  `${nPosX}% ${nPosY}%`;
    }

    /** Кнопка показать следующее изображение */
    fShowNextImg(e: MouseEvent){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const nNextIdx = this.idxCurrentSlide + 1;
        if (nNextIdx < this.aImages.length){
            this.nSwipeTransition = 0.4;
            this.fSwipe(nNextIdx);
        } else {
            this.nSwipeTransition = 0.6;
            this.fSwipe(0);
        }
    }

    /** Кнопка показать предыдущее изображение */
    fShowPreviousImg(e: MouseEvent){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const nPrevIdx = this.idxCurrentSlide - 1;
        if (nPrevIdx < 0) {
            this.nSwipeTransition = 0.6;
            this.fSwipe(this.aImages.length - 1);
        } else {
            this.nSwipeTransition = 0.4;
            this.fSwipe(nPrevIdx)
        }
    }

    /** Ресайз к точке */
    fScaleTo(nScale: number, nX: number, nY: number) {
        const nPrevScale = this.nScale
        this.nScale = nScale

        const elWrapper = this.$refs.imageSlider;
        const elZoom = document.getElementById(`zoom-${this.idxCurrentSlide}`) as HTMLDivElement;
        const vWrapperRect = elWrapper.getBoundingClientRect();
        const vZoomRect = elZoom.getBoundingClientRect();

        const nPictureX = nX - vWrapperRect.x - vWrapperRect.width / 2;
        const nPictureY = nY - vWrapperRect.y - vWrapperRect.height / 2;

        const nTargetX = this.nMoveX + nPictureX / nScale - nPictureX / nPrevScale;
        const nTargetY = this.nMoveY + nPictureY / nScale - nPictureY / nPrevScale;

        this.nMaxMoveDistanceX = (vZoomRect.width - vZoomRect.width / this.nScale) / 2 * this.nScale
        this.nMaxMoveDistanceY = (vZoomRect.height - vZoomRect.height / this.nScale) / 2 * this.nScale

        this.fMoveScaled(nTargetX, nTargetY);
    }


    /** Получить расстояния между пальцами */
    fGetDistance(t1: Touch, t2: Touch) {
        const a = t1.clientX - t2.clientX
        const b = t1.clientY - t2.clientY
        return Math.sqrt(a*a + b*b);
    }

    /** Начать ресайз двумя пальцами */
    fStartResize(e: TouchEvent) {
        this.nSwipeStartX = 0;
        this.nSwipeStartY = 0;
        this.nPreviousTapTime = 0;
        this.isStopAnimation = true;
        this.isResize = true;
        this.nStartDistance = this.fGetDistance(e.touches[0], e.touches[1]);
        this.nStartScale = this.nScale;

        this.nMiddleX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        this.nMiddleY = (e.touches[0].clientY + e.touches[1].clientY) / 2
    }

    /** Обработчик ресайза двумя пальцами */
    fResizeHandler(e: TouchEvent) {
        e.preventDefault()
        const nScale = this.nStartScale * (this.fGetDistance(e.touches[0], e.touches[1]) / this.nStartDistance) * SCALE_FACTOR
        if (nScale >= MAX_SCALE) {
            this.fScaleTo(MAX_SCALE, this.nMiddleX, this.nMiddleY)
        }
        else if (nScale < 1) {
            this.fScaleTo(1, this.nMiddleX, this.nMiddleY)
        } else {
            this.fScaleTo(nScale, this.nMiddleX, this.nMiddleY)
        }
    }

    /** Проверить двойной тап */
    fDoubleTapCheck() {
        let isDoubleTap = false
        const nNow = new Date().getTime()
        if (this.nPreviousTapTime) {
            const nTimeSince = nNow - this.nPreviousTapTime;
            if (nTimeSince < DOUBLE_TAP_INTERVAL_MS) {
                this.nPreviousTapTime = 0
                isDoubleTap = true;
                this.isOneTap = false;
            } else {
                this.nPreviousTapTime = nNow
            }
        } else {
            this.nPreviousTapTime = nNow
        }
        return isDoubleTap
    }

    /** Двойной тап */
    fDoubleTap(e: TouchEvent) {
        e.preventDefault();
        this.isStopAnimation = false
        if (this.nScale !== 1) {
            this.fCancelScale()
        } else {
            this.fScaleTo(DOUBLE_TAP_SCALE, e.touches[0].clientX, e.touches[0].clientY)
        }
    }

    /** Начать передвижение содержимого */
    fStartMoveScaled(e: TouchEvent) {
        e.preventDefault();
        this.isStopAnimation = true

        this.nMoveScaledStartX = e.touches[0].clientX
        this.nMoveScaledStartY = e.touches[0].clientY
        this.nMoveScaledX = this.nMoveX
        this.nMoveScaledY = this.nMoveY
        this.isMoveScaled = this.nScale > 1

        const wrapper = document.getElementById(`zoom-${this.idxCurrentSlide}`) as HTMLDivElement;

        const vRect = wrapper.getBoundingClientRect()
        this.nMaxMoveDistanceX = (vRect.width - vRect.width / this.nScale) / 2 / this.nScale
        this.nMaxMoveDistanceY = (vRect.height - vRect.height / this.nScale) / 2 / this.nScale
    }

    /** Обработчик передвижения содержимого */
    fMoveScaledHandler(e: TouchEvent) {
        e.preventDefault();
        this.nPreviousTapTime = 0

        const nX = e.touches[0].clientX - this.nMoveScaledStartX
        const nY = e.touches[0].clientY - this.nMoveScaledStartY
        this.fMoveScaled(this.nMoveScaledX + nX / this.nScale, this.nMoveScaledY + nY / this.nScale)
    }

    /** Перемещение приближенного участка изображения */
    fMoveScaled(nX: number, nY: number) {
        /** Движение по оси X */
        if (nX > this.nMaxMoveDistanceX) {
            this.nMoveX = this.nMaxMoveDistanceX
            this.isMoveScaled = false;
        } else if (nX < -this.nMaxMoveDistanceX) {
            this.nMoveX = -this.nMaxMoveDistanceX
        } else {
            this.nMoveX = nX
        }
        /** Движение по оси Y */
        if (nY > this.nMaxMoveDistanceY) {
            this.nMoveY = this.nMaxMoveDistanceY
        } else if (nY < -this.nMaxMoveDistanceY) {
            this.nMoveY = -this.nMaxMoveDistanceY
        } else {
            this.nMoveY = nY
        }
    }


    /** Отменить всё и вернуть как было */
    fCancelScale() {
        this.isStopAnimation = false
        this.nMoveX = 0
        this.nMoveY = 0
        this.nScale = 1
    }

    /** Обработчик изменения индекса из родителя */
    @Watch('value')
    fSipeByProp(){
        this.nSwipeTransition = 0.4;
        this.fSwipe(this.value)
    }

    /** Определение актуальных размеров слайдера */
    fGetSliderSize(){
        this.nSlideWidth = this.$refs.imageSlider.clientWidth;
        this.nSlideHeight = this.$refs.imageSlider.clientHeight;
        let nTransform = 0;
        /** Запись правильных позиций каждого изображения */
        for(let i = 0; i < this.aImages.length; i++){
            this.ixEachImgPos[i] = nTransform;
            nTransform -= this.nSlideWidth;
        }

        this.nSwipeTransition = 0;
        this.fSwipe(this.value);
    }

    mounted(){
        this.fGetSliderSize();
        window.addEventListener('resize', this.fGetSliderSize, { passive: true });
    }

    beforeDestroy(){
        /** Отключение слушателей событий */
        window.removeEventListener('resize', this.fGetSliderSize);
    }

    /** Трансформ приближенного изображения */
    get sTransform() {
        return `scale(${this.nScale}) translate(${this.nMoveX}px, ${this.nMoveY}px)`
    }

    /** Индекс текущего стайда */
    get idxCurrentSlide(){
        return this.value
    }

    get vImgStyleLocal(){
        return this.vImgStyle ?? {};
    }

    /** Индекс текущего стайда */
    set idxCurrentSlide(value){
        this.$emit('input', value);
    }
}
