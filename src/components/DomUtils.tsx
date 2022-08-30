/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const PAGE_WIDTH = 620;
const CELL_PADDING = 20;
const CELL_BORDER_WIDTH = 1;
const CELL_TOTAL_PADDING = (CELL_PADDING * 2) + (CELL_BORDER_WIDTH * 2);
const TABLE_HEADING_BG_COLOR = '#d9ead3';

function calculateAspectRatioFit(width: number, height: number, maxWidth: number, maxHeight: number) {
    if (width > height) {
        if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
        }
    }

    return [width, height];
}

function decorateImg(img: HTMLImageElement, colCount: number) {
    const url = new URL(img.src);
    const maxWidth = (PAGE_WIDTH - CELL_TOTAL_PADDING) / colCount;
    const size = calculateAspectRatioFit(img.width, img.height, maxWidth, maxWidth);
    img.setAttribute('data-og-width', img.width.toString());
    img.setAttribute('data-og-height', img.height.toString());
    img.width = size[0];
    img.height = size[1];
    img.style.marginLeft = "0";
    img.style.marginTop = "0";

    img.parentElement.parentElement.style.marginTop = '0px';
    img.parentElement.parentElement.style.lineHeight = '1.656pt';
    img.parentElement.parentElement.dir = 'ltr';

    img.parentElement.replaceWith(img);
}

function decorateTd(td: HTMLTableCellElement) {
    td.style.verticalAlign = 'top';
    td.style.padding = "5px 5px 5px 5px";
    td.style.border = "1px solid #000";
    td.style.verticalAlign = "top";
    td.style.overflowWrap = "break-word";
    td.style.overflow = "hidden";
    td.style.marginTop = "0";
    td.style.marginBottom = "0";
    td.style.width = "33%";
}

function decorateTable(table: HTMLTableElement) {
    table.style.border = 'none';
    table.style.borderCollapse = 'none';
    table.style.width = '100%';
}

export function createTable(data: any, document: Document, blockClasses: string = '') {
    let colCount = 0;
    const table = document.createElement('table');
    decorateTable(table);
    const maxColumns = data.length > 1 ? data[1].length : 1;
    data.forEach((row: any, index: number) => {
        const tr = document.createElement('tr');
        row.forEach((cell: any) => {
            const t = document.createElement('td');
            if (index === 0) {
                t.colSpan = maxColumns;
                t.style.backgroundColor = TABLE_HEADING_BG_COLOR;
                tr.style.height = "22.5pt";
                const classes = cell.split(' ');
                const blockName = classes.shift();
                cell = `${blockName}${(blockClasses) ? ` (${blockClasses})` : ''}`;
            }

            decorateTd(t);
            if (typeof cell === 'string') {
                t.innerHTML = cell;
            } else if (Array.isArray(cell)) {
                cell.forEach((c) => {
                    t.append(c);
                });
            } else {
                t.append(cell);
            }
            tr.appendChild(t);
            if (index === 1) {
                colCount = row.length;
            }
        });
        table.appendChild(tr);
    });


    const colGroup = document.createElement('colgroup');
    colGroup.innerHTML = `<col><col><col>`;
    table.prepend(colGroup);

    return table;
}

export function computeBlockName(str: string) {
    return str
        .replace(/\s(.)/g, (s) => s.toUpperCase())
        .replace(/^(.)/g, (s) => s.toUpperCase());
}

export function createSectionMetadata(element: HTMLElement, document: Document, story: any) {
    const data = [['section-metadata']];
    const sectionStyle = story.args.sectionStyles;
    if (sectionStyle) {
        if (typeof sectionStyle === 'string') {
            data.push(['style', sectionStyle]);
        } else if (Array.isArray(sectionStyle)) {
            data.push(['style', sectionStyle.join(', ')]);
        }
    }

    if (story.argTypes) {
        for (const type of Object.values(story.argTypes) as any) {
            const { table } = type;
            if (table && type.name !== 'sectionStyles') {
                const { category } = table;
                if (category && category.toLowerCase() === 'section') {
                    const value = story.args[type.name];
                    if (typeof value === 'string') {
                        data.push([type.name, value]);
                    } else if (Array.isArray(value)) {
                        data.push([type.name, value.join(', ')]);
                    }
                }
            }
        }
    }

    if (data.length > 1) {
        const metadataTable = createTable(data, document);
        element.prepend(metadataTable);
    }
}

export function convertBlocksToTables(element: HTMLElement, document: Document, blockClasses: string) {
    element.querySelectorAll('div[class]').forEach((block) => {
        const name = computeBlockName(block.className);
        const data = [[name]];
        const divs = block.querySelectorAll(':scope > div');
        if (divs) {
            divs.forEach((div) => {
                div.classList.add(blockClasses);
                const subDivs = div.querySelectorAll(':scope > div');
                if (subDivs && subDivs.length > 0) {
                    const rowData: any[] = [];
                    subDivs.forEach((cell) => {
                        if (cell.nodeName === 'DIV') {
                            const imgs = cell.querySelectorAll('img');
                            imgs.forEach((img) => decorateImg(img, subDivs.length));
                            const cellContent: any[] = [];
                            Array.from(cell.childNodes).forEach((c) => cellContent.push(c));
                            rowData.push(cellContent);
                        }
                    });
                    data.push(rowData);
                } else {
                    data.push([div.innerHTML]);
                }
            });
        }
        const table = createTable(data, document, blockClasses);
        block.innerHTML = '';
        block.appendChild(table);
    });
}

export function convertTablesToBlocks(element: HTMLElement, document: Document) {
    element.querySelectorAll('table').forEach((table) => {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('wrap');
        table.querySelectorAll('tr:not(:first-of-type)').forEach((row, index) => {
            const rowDiv = document.createElement('div');
            row.querySelectorAll('td').forEach((col) => {
                const colDiv = document.createElement('div');
                col.querySelectorAll('img').forEach((img) => {
                    const paragraph = document.createElement('p');
                    const picture = document.createElement('picture');
                    img.width = Number(img.getAttribute('data-og-width'));
                    img.height = Number(img.getAttribute('data-og-height'));
                    img.parentElement.replaceWith(paragraph);
                    paragraph.append(picture);
                    picture.append(img);

                });
                Array.from(col.childNodes).forEach((c) => colDiv.append(c));
                rowDiv.appendChild(colDiv);
            });
            wrapperDiv.appendChild(rowDiv);
        });
        table.replaceWith(wrapperDiv.firstChild);
    });

    return (element.firstChild as HTMLElement).innerHTML;
}