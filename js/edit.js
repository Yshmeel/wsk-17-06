
const SIDE_LEFT = 'left';
const SIDE_RIGHT = 'right';
const SIDE_TOP = 'top';
const SIDE_BOTTOM = 'bottom';

const POINT_WIDTH = 74;
const POINT_HEIGHT = 74;

const DEFAULT_MARGIN_BETWEEN_POINTS = 20;

const POINT_FORM_CIRCLE = 'circle';
const POINT_FORM_SQUARE = 'square';
const POINT_FORM_STAR = 'star';
const POINT_FORM_DROP = 'drop';

/**
 * type - point/relation
 * [
 *  {
 *     type: string,
 *      id: number,
 *      description: string,
 *      form: string,
 *      x: number,
 *      y: number,
 *      start: bool,
 *  },
 *  {
 *      type: string,
 *      relation_from_id: number,
 *      relation_to_id: number,
 *      from_side: string,
 *      to_side: string,
 *      from_name: string,
 *      to_name: string
 *  }
 * ]
 */

const POINT_CONTENT_TEMPLATE = `
    <div class="point-shape">
        <div class="point-pizza">
            <div class="point-pizza-item first" draggable="true" data-side="top">
                <span>1</span>
            </div>
            <div class="point-pizza-item second" draggable="true" data-side="right">
                <span>2</span>
            </div>
            <div class="point-pizza-item third" draggable="true" data-side="left">
                <span>3</span>
            </div>
            <div class="point-pizza-item fourth" draggable="true" data-side="bottom">
                <span>4</span>
            </div>
        </div>
    </div>
    
    <div class="point-buttons">
        <button type="button" class="btn delete">D</button>
        <button type="button" class="btn edit">E</button>
    </div>
`;

const LINE_TEMPLATE = `
    <line x1="{{x1}}" y1="{{y1}}" x2="{{x2}}" y2="{{y2}}" style="stroke:rgb(255,0,0);stroke-width:2" />
`

// DOM elements
const $container = document.getElementById('point-editor');
let svgContainer = null;

const getPointElementByID = (id) => {
    return document.querySelector(`.point[data-point-id="${id}"]`)
};

/**
 *
 */
const clearPresentation = () => {

};

/**
 *
 */
const draw = () => {

};

/**
 * step 1: delete all lines from points
 * step 2: get all relations
 * step 3: determine all current coordinates between two points
 * step 4: push them into the line. x1, y1 - from, x2, y2 - to
 * step 5: loop it through all relations
 */
const recreateAllRelations = () => {
    svgContainer.innerHTML = '';

    const relations = window._core.getRelations();

    relations.forEach((relation) => {
        const fromPoint = window._core.getPointByID(relation.relation_from_id);
        const toPoint = window._core.getPointByID(relation.relation_to_id);

        if(!fromPoint || !toPoint) {
            return;
        }

        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', fromPoint.x+(POINT_WIDTH/2));
        line.setAttribute('y1', fromPoint.y+(POINT_HEIGHT/2));
        line.setAttribute('x2', toPoint.x+(POINT_WIDTH/2));
        line.setAttribute('y2', toPoint.y);
        line.style.stroke = 'rgb(255, 0, 0)';
        line.style.strokeWidth = 2;

        svgContainer.append(line);
    });
};

const updateAllPointsRelations = () => {
    const points = $container.querySelectorAll('.point');
    Array.from(points).forEach((point) => {
        const pointID = parseInt(point.getAttribute('data-point-id'));
        const pizzaItems = point.querySelectorAll('.point-pizza-item');

        Array.from(pizzaItems).forEach((item) => {
            const side = item.getAttribute('data-side');
            const hasRelation = window._core.hasPointSideRelation(pointID, side);

            if(hasRelation) {
                item.classList.add('disabled');
            } else {
                item.classList.remove('disabled');
            }
        });
    });
};

/**
 *
 * @param from
 * @param to
 * @param fromSide
 * @param toSide
 */
const createRelation = (from, to, fromSide, toSide) => {
    const relation = {
        type: 'relation',
        relation_from_id: from.id,
        relation_to_id: to.id,
        from_side: fromSide,
        to_side: toSide,
        from_name: '',
        to_name: ''
    };

    window._core.push(relation);
};

const createPoint = (x, y, form, start = false) => {
    const point = {
        type: 'point',
        id: Date.now(),
        description: '',
        form,
        x, y,
        start,
    };

    window._core.push(point);
    renderPoint(point);
};

const createParentPoint = (parent, side) => {
    let x, y;

    let reversedSide = '';

    // determine new x and y coords
    switch(side) {
        case SIDE_LEFT:
            x = parent.x - POINT_WIDTH - DEFAULT_MARGIN_BETWEEN_POINTS;
            y = parent.y;

            reversedSide = SIDE_RIGHT;
            break;
        case SIDE_RIGHT:
            x = parent.x + POINT_WIDTH + DEFAULT_MARGIN_BETWEEN_POINTS;
            y = parent.y;

            reversedSide = SIDE_LEFT;
            break;
        case SIDE_TOP:
            x = parent.x;
            y = parent.y - POINT_WIDTH - DEFAULT_MARGIN_BETWEEN_POINTS;

            reversedSide = SIDE_BOTTOM;
            break;
        case SIDE_BOTTOM:
            x = parent.x;
            y = parent.y + POINT_WIDTH + DEFAULT_MARGIN_BETWEEN_POINTS;

            reversedSide = SIDE_TOP;
            break;
    }

    const point = {
        type: 'point',
        id: Date.now(),
        description: '',
        form: '',
        x, y
    };

    // append all new items to store
    window._core.push(point);
    createRelation(parent, point, side, reversedSide);
    renderPoint(point);

    redraw();
};

const createNewPresentation = () => {
    window._core.setItems([]);

    // x, y is center of playable screen
    createPoint(window.innerWidth/2, window.innerHeight/2, POINT_FORM_CIRCLE, true);
};

const recursivelyDeletePoints = (point, fromRelations, toRelations) => {
    fromRelations.forEach((relation) => {
        const toPoint = window._core.getPointByID(relation.relation_to_id);

        const _fromRelations = window._core.getAllRelationsFromPoint(toPoint);
        const _toRelations = window._core.getAllRelationsToPoint(toPoint);

        if(_fromRelations.length === 0 && _toRelations.length === 0) {
            deletePoint(toPoint);
        }

        window._core.deleteRelationByFromAndToID(relation.relation_from_id, relation.relation_to_id);
    });

    toRelations.forEach((relation) => {
        window._core.deleteRelationByFromAndToID(relation.relation_from_id, relation.relation_to_id);
    });
};

const deletePoint = (point, recursive = true) => {
    const fromRelations = window._core.getAllRelationsFromPoint(point.id);
    const toRelations = window._core.getAllRelationsToPoint(point.id);

    if(point.start) {
        return false;
    }

    if(recursive) {
        recursivelyDeletePoints(point, fromRelations, toRelations);
    }

    $container.querySelector(
        `.point[data-point-id="${point.id}"]`
    ).remove();

    window._core.deletePointByID(point.id);

    redraw();
};

/* Renders */
const renderPoint = (data) => {
    const template = POINT_CONTENT_TEMPLATE.replace("{{id}}", data.id)
        .replace("{{x}}", data.x)
        .replace("{{y}}", data.y);

    const point = document.createElement('div');
    point.classList.add('point');
    point.classList.add(`form-${data.form}`);
    point.setAttribute('draggable', true);
    point.setAttribute('data-point-id', data.id);
    point.style.top = `${data.y}px`;
    point.style.left = `${data.x}px`;

    point.innerHTML = template;

    // remove delete button from start point
    if(data.start) {
        point.querySelector('.delete').remove();
    }

    bindPointEvents(point, data);
    bindPizzaEvents(point, data);
    $container.append(point);

    setTimeout(() => {
        point.classList.add('animated');
    }, 50);
};

const updatePointCoordinates = (id, x, y) => {
    const point = window._core.getPointByID(id);
    point.x = x;
    point.y = y;

    window._core.save();
};

// Pizza events
// Click event: Create item
// Creates new parent point based on pizza-item side
const pizzaCreateItem = (pizzaItem, point) => () => {
    if(pizzaItem.classList.contains('disabled')) {
        return false;
    }

    const side = pizzaItem.getAttribute('data-side');
    createParentPoint(point, side);
};

// Binder for events
const bindPizzaEvents = (dom, point) => {
    const pizzaItems = Array.from(
        dom.querySelectorAll(".point-pizza-item")
    );

    pizzaItems.forEach((item) => {
        let draggable = false;

        item.addEventListener(
             'click',
             pizzaCreateItem(item, point)
        );
    });
};


// Point events
const bindPointEvents = (dom, point) => {
    let dragging = false;

    const $delete = dom.querySelector('.delete');

    if($delete) {
        $delete.addEventListener('click', function(e) {
            deletePoint(point);
        });
    }

    const $edit = dom.querySelector('.edit');

    if($edit) {
        $edit.addEventListener('click', function(e) {
            openEditModal(point);
        });
    }

    dom.addEventListener('dragstart', function(e) {
        dom.style.cursor = 'move';
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        dragging = true;
    });

    dom.addEventListener('drag', function(e) {
        if(dragging && e.y !== 0 && e.x !== 0) {
            let x = e.x, y = e.y;

            if(e.x > window.innerWidth) {
                x = window.innerWidth;
            }

            if(e.y > window.innerHeight) {
                y =  window.innerHeight;
            }

            dom.style.left = `${x}px`;
            dom.style.top = `${y}px`;

            point.x = x;
            point.y = y;

            recreateAllRelations();
        }
    });

    dom.addEventListener('dragend', function(e) {
        dom.style.cursor = 'default';
        dragging = false;
        updatePointCoordinates(point.id, e.x, e.y);
    })
};

const redraw = () => {
    recreateAllRelations();
    updateAllPointsRelations();
};

const init = () => {
    const points = window._core.getPoints();

    if(points.length === 0) {
        createNewPresentation();
    } else {
        points.forEach(renderPoint);
    }

    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    overlay.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    svgContainer = overlay;
    $container.appendChild(overlay);

    recreateAllRelations();
    updateAllPointsRelations();

    window._editor = new FroalaEditor('#summernote');

    // modal functionality
    const $modal = document.querySelector('.modal');

    $modal.querySelector('.btn-close').addEventListener('click', function() {
        jQuery('.modal').fadeOut(300);
    });

    $modal.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const $editPointIDInput =   document.getElementById('edit-point-id');
        const pointID = parseInt($editPointIDInput.getAttribute('data-point-id'));

        const formRelations = document.querySelector('.form-relations').querySelectorAll('input');
        Array.from(formRelations).forEach((v) => {
            const neighborPointID = parseInt(v.getAttribute('data-point-id'));
            const dir = v.getAttribute('data-dir');

            const relation = window._core.getRelationByFromAndToID(dir === 'from' ? neighborPointID : pointID,
                dir === 'from' ? pointID : neighborPointID);

            if(!relation) {
                return;
            }

            if(dir === 'from') {
                relation.to_name = v.value;
            } else {
                relation.from_name = v.value;
            }
        });

        const point = window._core.getPointByID(pointID);
        point.description = window._editor.html.get();

        window._core.save();

        jQuery('.modal').fadeOut(300);
    });

    // prevent forbidden cursor
    document.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
};

// edit modal

const openEditModal = (point) => {
    const fromRelations = window._core.getAllRelationsFromPoint(point.id);
    const toRelations = window._core.getAllRelationsToPoint(point.id);

    const formRelations = document.querySelector('.form-relations');

    formRelations.innerHTML = '';

    [...fromRelations, ...toRelations].forEach((relation) => {
        const relationElement = document.createElement('div');
        relationElement.classList.add('form-relation');

        let pointID, name;
        let dir;

        if(relation.relation_from_id === point.id) {
            pointID = relation.relation_to_id;
            name = relation.from_name;
            dir = 'to';
        } else {
            pointID = relation.relation_from_id;
            name = relation.to_name;
            dir = 'from';
        }

        relationElement.innerHTML = `
            <input type="text" placeholder="Relation name" value="${name}" id="relation-${pointID}" data-point-id="${pointID}" data-dir="${dir}">
        `;

        formRelations.appendChild(relationElement);
    });

    window._editor.html.set(point.description);
    document.getElementById('edit-point-id').setAttribute('data-point-id', point.id);

    jQuery('.modal').fadeIn(300);
};

// expose only public method *init*
window._editor = {
    init,
};
