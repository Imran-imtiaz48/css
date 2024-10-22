window.onload = function() {

    const toc = document.querySelector('.toc');
    const tocPath = document.querySelector('.toc-marker path');
    let tocItems = [];

    const TOP_MARGIN = 0.1,
          BOTTOM_MARGIN = 0.2;

    let pathLength, lastPathStart, lastPathEnd;

    window.addEventListener('resize', drawPath);
    window.addEventListener('scroll', sync);

    drawPath();

    function drawPath() {
        tocItems = Array.from(toc.querySelectorAll('li')).map(item => {
            const anchor = item.querySelector('a');
            const target = document.getElementById(anchor.getAttribute('href').slice(1));

            return { listItem: item, anchor, target };
        }).filter(item => item.target);

        let path = [];
        let pathIndent;

        tocItems.forEach((item, i) => {
            const x = item.anchor.offsetLeft - 5,
                  y = item.anchor.offsetTop,
                  height = item.anchor.offsetHeight;

            if (i === 0) {
                path.push(`M${x},${y}L${x},${y + height}`);
                item.pathStart = 0;
            } else {
                if (pathIndent !== x) path.push(`L${pathIndent},${y}`);

                path.push(`L${x},${y}`);

                tocPath.setAttribute('d', path.join(' '));
                item.pathStart = tocPath.getTotalLength() || 0;

                path.push(`L${x},${y + height}`);
            }

            pathIndent = x;

            tocPath.setAttribute('d', path.join(' '));
            item.pathEnd = tocPath.getTotalLength();
        });

        pathLength = tocPath.getTotalLength();
        sync();
    }

    function sync() {
        const windowHeight = window.innerHeight;

        let pathStart = pathLength, 
            pathEnd = 0,
            visibleItems = 0;

        tocItems.forEach(item => {
            const { top, bottom } = item.target.getBoundingClientRect();

            if (bottom > windowHeight * TOP_MARGIN && top < windowHeight * (1 - BOTTOM_MARGIN)) {
                pathStart = Math.min(item.pathStart, pathStart);
                pathEnd = Math.max(item.pathEnd, pathEnd);
                visibleItems++;

                item.listItem.classList.add('visible');
            } else {
                item.listItem.classList.remove('visible');
            }
        });

        if (visibleItems > 0 && pathStart < pathEnd) {
            if (pathStart !== lastPathStart || pathEnd !== lastPathEnd) {
                tocPath.setAttribute('stroke-dashoffset', '1');
                tocPath.setAttribute('stroke-dasharray', `1, ${pathStart}, ${pathEnd - pathStart}, ${pathLength}`);
                tocPath.setAttribute('opacity', 1);
            }
        } else {
            tocPath.setAttribute('opacity', 0);
        }

        lastPathStart = pathStart;
        lastPathEnd = pathEnd;
    }

};
