import { filter } from 'lodash';
import { tr } from './translation.js';
import { KEYS } from './utils.js';

export default class Filters {
    constructor(main) {
        this.main = main;
    
        this.wrapper = main.wrapper.querySelector('.ptro-filters-widget-wrapper');
        this.input = main.wrapper.querySelector('.ptro-filters-widget-wrapper .ptro-filters-input');
        this.applyButton = main.wrapper.querySelector('.ptro-filters-widget-wrapper button.ptro-apply');
        this.closeButton = main.wrapper.querySelector('.ptro-filters-widget-wrapper button.ptro-close');
        this.errorHolder = main.wrapper.querySelector('.ptro-filters-widget-wrapper .ptro-error');
        this.filters = ['grayscale', 'sepia', 'invert', 'brightness', 'contrast',  'saturate', ];
        this.chosenFilter = this.filters[0];
        this.initCtxImageData = null;
        this.filterValue = 0;
        this.filtersForApply = this.createFiltersForApply()
        
    }

    createFiltersForApply() {
        const filtersForApply = {};
        this.filters.forEach((f) => {
            filtersForApply[f] = 0;
        });
        return filtersForApply;
    }

    createFilterString() {
        let filterString = '';
        for (const key in this.filtersForApply) {
            if (this.filtersForApply[key] !== 0) {
                filterString += `${key}(${this.filtersForApply[key]}%) `;
            }
        }
        return filterString;
    }

    getFilters() {
        return this.filters.map((f)=>{
            return {
                value: f,
                name: f,
                title: f,
            };
        });
    }
    setFilter(filter) {
        this.chosenFilter = filter;
        if (this.filtersForApply.hasOwnProperty(filter)) {
           this.filtersForApply[filter] = this.filterValue;
        //    console.log('filtersForApply', this.filtersForApply)
        }
    }

    

    setPercents(value) {
        this.filterValue = value;
        if (this.filtersForApply.hasOwnProperty(this.chosenFilter)) {
            this.filtersForApply[this.chosenFilter] = value;
            // console.log('filtersForApply', this.filtersForApply)

        }
    }

    getFilter() {
        const filterName = this.filters[0];
        return filterName 
    }

    applyFilter() {
        const w = this.main.size.w;
        const h = this.main.size.h;
        const tmpData = this.initCtxImageData;
        const tmpCan = this.main.doc.createElement('canvas');
        tmpCan.width = w;
        tmpCan.height = h;
        tmpCan.getContext('2d').putImageData(tmpData, 0, 0);
        this.main.ctx.save();
        this.main.ctx.filter = this.createFilterString();
        this.main.ctx.drawImage(tmpCan, 0, 0);
        // this.adjustSizeFull();
        // this.ctx.restore();
        this.main.worklog.captureState();
        // this.main.closeActiveTool();
    }

    saveInitImg() {
        this.initCtxImageData = this.main.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
        this.createFiltersForApply();
    }

    open() {
        this.wrapper.removeAttribute('hidden');
        this.opened = true;
    }

    close() {
        this.wrapper.setAttribute('hidden', '');
        this.opened = false;
    }

    startClose() {
        this.errorHolder.setAttribute('hidden', '');
        this.main.closeActiveTool();
    }
    getValue(){
        return
    }

    static html (main){
        return '' +
        '<div class="ptro-filters-widget-wrapper ptro-common-widget-wrapper ptro-v-middle" hidden>' +
        '   <div class="ptro-filters-widget-content ptro-common-widget-content">' +
        '       <div class="ptro-filters-widget-title">' + tr('filters') + '</div>' +
        '       <div class="ptro-filters-widget-input-wrapper">' +
        '           <div class="ptro-error ptro-error-hidden">' + tr('wrongFilterValue') + '</div>' + 
        '       </div>' +
        '       <div class="ptro-filters-widget-buttons">' +
        '           <button type="button" class="ptro-apply ptro-color-control">' + tr('apply') + '</button>' +
        '           <button type="button" class="ptro-close ptro-color-control">' + tr('close') + '</button>' +
        '       </div>' +
        '   </div>' +
        '</div>';
    }
   
    }