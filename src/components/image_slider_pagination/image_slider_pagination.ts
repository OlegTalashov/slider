import Component from 'vue-class-component';
import { Prop, Vue, Watch } from 'vue-property-decorator';
/**
 * Компонент image_switch_pagination принимает
 * @ value - Индекс текущего выбранного изображения
 * @ aImages - Массив изображений (S3ItemImgIDsIWithAlt)
 * @ fGetImgSrc - Функция получения изображения
 * @ nCountItems - Количество изображений (для пагинации точками)
 * @ sAlign - Позицианирование пагинации left | center | right
 * @ bShowFade - Показывать ли размытие в конце пагинации
 */

@Component
export default class image_switch_pagination extends Vue {
    /** Индекс текущего выбранного изображения */
    @Prop({ type: Number, default: 0 }) value!: number;
    /** Массив изображений */
    @Prop({ type: Array, required: false, default: () => [] }) aImages!: any[];
    /** Функция получения изображения */
    @Prop({ type: Function, required: false }) fGetImgSrc!: (img: any) => string;
    /** Количество изображений (для пагинации точками) */
    @Prop({ type: Number, default: 0 }) nCountItems!: number;
    /** Позицианирование пагинации left | center | right */
    @Prop({ type: String, default: 'center' }) sAlign!: string;
    /** Показывать ли размытие в конце пагинации */
    @Prop({ type: Boolean, default: true }) bShowFade!: boolean;
    
    $refs!: {
        imageSliderPagination: HTMLDivElement,
        scroll: HTMLElement
    }

    /** Положение точек */
    nTransform: number = 0;
    /** Размер точки */
    nCircleSize: number = 5;
    /** Расстояние между точками / паддинг окошка с точками */
    nCirclePadding: number = 2.5;
    /** Максимальная ширина пагинации точками (исходя из размера и количества точек) */
    nMaxPaginationWidth: number = 40;
    /** Размер изображения при пагинации картинками */
    nImageSize: number = 40;
    /** Ширина компонента */
    nComponentWidth: number = 100;

    /** Функция получения изображения */
    fGetImgSrcLocal(img: any){
        return this.fGetImgSrc(img);
    }

    /**
     * Автоматический скролл к выбранному элементу
     */
    @Watch('value')
    fAutoScroll(){
        /** Логика пагинации точками */
        if (this.isDotPagination){
            if (this.nCountImagesLocal > 5){
                if (this.idxCurrentSlide < 3){
                    this.nTransform = 0;
                }
                else if (this.idxCurrentSlide > this.nCountImagesLocal - 3){
                    this.nTransform = -this.nSlideDistance * (this.nCountImagesLocal - 5);
                }
                else {
                    this.nTransform = -this.nSlideDistance * (this.idxCurrentSlide - 2);
                }
            }
        } 
        /** Логика пагинации изображениями */
        else {
            /** Элемент скролла */
            const elScroll = this.$refs.scroll as HTMLElement;
            /** Текущее положение скролла */
            const nCurrentScrollX = elScroll.scrollLeft;
            /** Положение изображения, соответствующего индексу */
            let nScrollToImage = this.nSlideDistance * this.value;
            /** Флаг необходимости скролла влево */
            const bScrollRight = nScrollToImage > nCurrentScrollX + this.nComponentWidth - (this.nSlideDistance * 1.5);
            /** Флаг необходимости скролла вправо */
            const bScrollLeft = nScrollToImage - this.nSlideDistance * 0.5 < nCurrentScrollX;

            /** Скролл влево */
            if (bScrollLeft){
                nScrollToImage -= this.nSlideDistance * 0.5
                elScroll.scrollTo({left: nScrollToImage, behavior: 'smooth'})
            }
            /** Скролл вправо */
            else if (bScrollRight) {
                nScrollToImage -= this.nComponentWidth - this.nSlideDistance * 1.5
                elScroll.scrollTo({left: nScrollToImage, behavior: 'smooth'})
            }
        }
    }

    /** Выбрать карточку */
    fSelectCard(idx: number, e: Event){
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        this.idxCurrentSlide = idx;
    }

    /** Получение размеров компонента */
    fGetSizes(){
        const nComponentHeight = this.$refs.imageSliderPagination.clientHeight;
        if (this.isDotPagination){
            /** Паддинг - 12% от высоты компонента */
            this.nCirclePadding = Math.round(nComponentHeight / 100 * 12);
            /** Размер точки - 76% от высоты компонента */
            this.nCircleSize =  Math.round(nComponentHeight / 100 * 76);
        } else {
            this.nImageSize = nComponentHeight - 15;
            this.nComponentWidth = this.$refs.imageSliderPagination.clientWidth;
        }
    }

    mounted(){
        this.fGetSizes();
        /** Слушатель "resize" для корректного отображения при изменении параметров экрана */
        window.addEventListener(`resize`, this.fGetSizes, { passive: true });
    }

    beforeDestroy(){
        /** Отключение слушателя */
        window.removeEventListener(`resize`, this.fGetSizes);
    }

    /** Количество изображений для пагинации */
    get nCountImagesLocal(){
        return this.nCountItems ? this.nCountItems : this.aImages.length;
    }

    /** Пагинация точками (В ином случае с изображениями) */
    get isDotPagination(){
        return !this.aImages.length;
    }

    /** Количество отображаемых точек */
    get nDisplayedCirclesCount(){
        return this.nCountImagesLocal > 5 ? 5 : this.nCountImagesLocal;
    }

    /** Полная шириша пагинации точками */
    get nPaginationWidth(){
        return this.nDisplayedCirclesCount * (this.nCircleSize + this.nCirclePadding) + this.nCirclePadding;
    }
    
    /** Дистанция одного слайда */
    get nSlideDistance(){
        const nSlideDistance = this.isDotPagination
            ? this.nCircleSize + this.nCirclePadding
            : this.nImageSize + (this.nImageSize / 10)
        return nSlideDistance;
    }

    /** Показывать ли размытие в конце пагинации */
    get bShowFadeLocal(){
        return !this.isDotPagination && this.bShowFade && this.idxCurrentSlide !== this.nCountImagesLocal - 1;
    }

    /** Индекс текущего стайда */
    get idxCurrentSlide(){
        return this.value
    }
    
    /** Индекс текущего стайда */
    set idxCurrentSlide(value){
        this.$emit('input', value);
    }
}
