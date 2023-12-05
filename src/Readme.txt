for start: crtl + `, затем "npm i" 

1) Стили, предназначенные для секции
.section
.section__title
.section__text
.section__link
.section-background - стиль для класса .news-card с синим бэкграундом

2) .news-card - класс для карточек с новостями ( обычно идёт самым последним блоком перед футером ) 

.news-card__item-img - класс для Wrapper картинки
.news-card__item-info - класс для Wrapper с информацией


3) .image-wrapper - класс для wrapper-а картинки

корректируется размер с помощью padding
стили с определенным padding:
.image-wrapper-s
.image-wrapper-sm
.image-wrapper-m
.image-wrapper-responsive


4) В основном всё построено на мапах. sass:map

Чтобы создать map, достаточно:

$itISMap: (
   mapVariable: 'mapValue'
)
Чтобы обратиться к мапу:

Глобально:

map-get($itIsMap, mapVariable)

   Или 

Через импорт

@use 'variables' as var;
@use 'sass:map' as map;

map(var.$itIsMap, mapVariable);

Готово!

Цвета, ширины, переменные, maps - можно найти в ./styles/variables

Подробно о возможностях dart:sass : https://sass-lang.com/documentation/modules/map
