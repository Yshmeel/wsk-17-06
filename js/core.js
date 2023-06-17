(function() {
    let items = [];

    let currentMode = 'edit';

// DOM element
    const $app = document.getElementById('app');

    /**
     * Inits all application
     */
    const init = () => {
        items = window._storage.get();

        // window._mode being placed at specific .html page
        // index.html - edit
        // view.html - view
        changeMode('edit');

        setTimeout(() => {
            window._editor.init();
            window._viewer.init();
        }, 300);

        document.querySelector('.presentation-mode').addEventListener('click', function(e) {
            changeMode(currentMode === 'edit' ? 'view' : 'edit');

            switch(currentMode) {
                case 'view':
                    e.target.innerHTML = 'Edit mode';
                    break;
                case 'edit':
                    e.target.innerHTML = 'Presentation mode';
                    break;
            }
        })
    };

    const getCurrentMode = () => {
        return currentMode;
    };

    const changeMode = (mode) => {
        currentMode = mode;

        if(mode === 'edit') {
            jQuery('.point-view').fadeOut(100);
            jQuery('#point-editor').fadeIn(300);
            try {
                document.exitFullscreen().then(() => {}).catch(() => {});
            } catch(e) { }
        } else {
            jQuery('#point-editor').fadeOut(100);
            jQuery('.point-view').slideDown(300);

            document.documentElement.requestFullscreen();
            window._viewer.init();
        }
    };

    /**
     *
     * @returns {*[]}
     */
    const getPoints = () => {
        return items.filter((v) => v.type === 'point');
    };

    /**
     * Get point by ID
     * @param id
     * @returns {*}
     */
    const getPointByID = (id) => {
        return items.find((v) => v.type === 'point' && v.id === id);
    };

    /**
     * @returns {*[{}]}
     */
    const getRelations = () => {
        return items.filter((v) => v.type === 'relation');
    };

    /**
     * Gets all relations from point by ID
     * @param {number} id
     *  * @returns {*[]}
     */
    const getAllRelationsFromPoint = (id) => {
        return items.filter((v) => v.type === 'relation' && v.relation_from_id === id);
    };

    /**
     * Get all relations to point by ID
     * @param id
     * @returns {*[]}
     */
    const getAllRelationsToPoint = (id) => {
        return items.filter((v) => v.type === 'relation' && v.relation_to_id === id);
    };

    const hasPointSideRelation = (id, side) => {
        const fromRelation = getAllRelationsFromPoint(id);
        const toRelation = getAllRelationsToPoint(id);

        let found = false;

        fromRelation.forEach((relation) => {
            if(relation.from_side === side) {
                found = true;
            }
        });

        toRelation.forEach((relation) => {
            if(relation.to_side === side) {
                found = true;
            }
        });

        return found;
    };

    const push = (...args) => {
        items.push(...args);
        save();
    };

    const setItems = (v) => {
        items = v;
        save();
    };

    const deletePointByID = (id) => {
        items = items.filter((i) => {
            if(i.type !== 'point') {
                return true;
            }

            return i.id !== id;
        });

        save();
    };

    const getRelationByFromAndToID = (fromID, toID) => {
        return items.find((i) => {
            return i.relation_from_id === fromID && i.relation_to_id === toID;
        })
    };

    const deleteRelationByFromAndToID = (fromID, toID) => {
        items = items.filter((i) => {
            if(i.type !== 'relation') {
                return true;
            }

            return i.relation_from_id !== fromID && i.relation_to_id !== toID;
        });

        save();
    };

    const save = () => {
        window._storage.set(items);
    };

    document.addEventListener('DOMContentLoaded', init);

    window._core = {
        items,
        getCurrentMode,
        getPointByID,
        getPoints,
        getRelations,
        getAllRelationsFromPoint,
        getAllRelationsToPoint,
        getRelationByFromAndToID,
        hasPointSideRelation,
        deletePointByID,
        deleteRelationByFromAndToID,
        push,
        save,
        setItems,
    };
}());
