(function() {
    const relationsContainer = document.querySelector('.point-relations');
    const contentInner = document.querySelector('.point-view-content-inner');

    let activePointID = null;

    const getStartPoint = () => {
        const points = window._core.getPoints();
        return points.find((p) => p.start);
    };

    const setDescription = (description) => {
        contentInner.innerHTML = description;
    };

    const setRelations = (point, relations) => {
        relationsContainer.innerHTML = '';

        relations.forEach((relation) => {
            const relationElement = document.createElement('div');
            relationElement.classList.add('point-relation');

            let pointID, name;

            if(relation.relation_from_id === point.id) {
                pointID = relation.relation_to_id;
                name = "To: " + (relation.from_name || 'Point ' + pointID);
            } else {
                pointID = relation.relation_from_id;
                name = "Back: " + (relation.to_name || 'Point ' + pointID);
            }

            relationElement.innerHTML = `
            <button type="button" data-point-id="${pointID}">
                ${name}
            </button>
        `;

            relationsContainer.appendChild(relationElement);
        });

        if(!point.start) {
            const relationElement = document.createElement('div');
            relationElement.classList.add('point-relation');

            relationElement.innerHTML = `
        <button type="button" data-point-id="${getStartPoint().id}">
            Back to start
        </button>
    `;

            relationsContainer.appendChild(relationElement);
        }

        bindRelationsEvents();
    };

    const bindRelationsEvents = () => {
        Array.from(relationsContainer.querySelectorAll('button')).forEach((btn) => {
            btn.addEventListener('click', function() {
                const pointID = parseInt(btn.getAttribute('data-point-id'));
                const point = window._core.getPointByID(pointID);

                setPoint(point);
            });
        });
    }

    const setPoint = (point) => {
        const from = window._core.getAllRelationsFromPoint(point.id);
        const to = window._core.getAllRelationsToPoint(point.id);

        setDescription(point.description || 'Point ' + point.id);
        setRelations(point, [...from, ...to]);

        activePointID = point.id;
    };

    const init = () => {
        window.addEventListener('keyup', function(e) {
            if(window._core.getCurrentMode() !== 'view') {
                return false;
            }

            const relationButtons = relationsContainer.querySelectorAll('button');

            switch(e.key) {
                case '1':
                    relationButtons[0]?.click();
                    break;
                case '2':
                    relationButtons[1]?.click();
                    break;
                case '3':
                    relationButtons[2]?.click();
                    break;
                case '4':
                    relationButtons[3]?.click();
                    break;
                case '5':
                    setPoint(getStartPoint());
                    break;
            }
        })

        setPoint(getStartPoint());
    };

    window._viewer = {
        init
    };
}());
