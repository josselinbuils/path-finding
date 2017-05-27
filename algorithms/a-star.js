window.AStart = function (heuristicWeight, heuristicType) {
    let nodeMap, startNode, targetNode, openList, closedList, cameFrom, time;

    function haveSamePosition(node1, node2) {
        return node1.x === node2.x && node1.y === node2.y;
    }

    this.findBestPath = (map, delay, nodeCallback, pathCallback) => {
        init(map);

        openList.push(startNode.clone());

        let id = setInterval(() => {

            if (openList.length === 0) {
                clearInterval(id);
                throw Error('NotFound');
            }

            let node = unstackOpenList();

            nodeCallback(node.x, node.y);

            if (haveSamePosition(node, targetNode)) {
                console.log('AStart:' + heuristicType + '-> path found in ' + (Date.now() - time) + 'ms');
                clearInterval(id);
                return reconstructPath(pathCallback);
            }

            let newCost = node.cost + 1;

            getNeighbors(node).forEach(neighbor => {
                let costFilter = n => haveSamePosition(n, neighbor) && n.cost <= newCost,
                    closedListSearch = closedList.filter(costFilter),
                    openListSearch = openList.filter(costFilter);

                if (closedListSearch.length === 0 && openListSearch.length === 0) {
                    cameFrom[neighbor.x + '-' + neighbor.y] = node;

                    neighbor.cost = newCost;
                    neighbor.heuristic = newCost + getHeuristic(neighbor) * heuristicWeight;

                    nodeCallback(neighbor.x, neighbor.y);

                    openList.push(neighbor.clone());
                }
            });

            closedList.push(node.clone());

        }, delay);
    };

    function getHeuristic(node) {
        switch (heuristicType) {
            case 'euclidean':
                return Math.sqrt(Math.pow(node.x - targetNode.x, 2) + Math.pow(node.y - targetNode.y, 2));
            case 'diagonal':
                let d = [Math.abs(node.x - targetNode.x), Math.abs(node.y - targetNode.y)],
                    dMin = Math.min(...d),
                    dMax = Math.max(...d);
                return dMin * 0.414 + dMax;
            case 'manhattan':
                return Math.abs(node.x - targetNode.x) + Math.abs(node.y - targetNode.y);
        }
    }

    function getNeighbors(node) {
        let neighbors = [];

        if (node.x > 0 && nodeMap[node.y][node.x - 1]) {
            neighbors.push(nodeMap[node.y][node.x - 1]);
        }

        if (node.y > 0 && nodeMap[node.y - 1][node.x]) {
            neighbors.push(nodeMap[node.y - 1][node.x]);
        }

        if (node.x < (nodeMap[0].length - 1) && nodeMap[node.y][node.x + 1]) {
            neighbors.push(nodeMap[node.y][node.x + 1]);
        }

        if (node.y < (nodeMap.length - 1) && nodeMap[node.y + 1][node.x]) {
            neighbors.push(nodeMap[node.y + 1][node.x]);
        }

        // Diagonal

        if (heuristicType === 'diagonal') {
            if (node.x > 0 && node.y > 0 && nodeMap[node.y - 1][node.x - 1]) {
                neighbors.push(nodeMap[node.y - 1][node.x - 1]);
            }

            if (node.y > 0 && node.x < (nodeMap[0].length - 1) && nodeMap[node.y - 1][node.x + 1]) {
                neighbors.push(nodeMap[node.y - 1][node.x + 1]);
            }

            if (node.x < (nodeMap[0].length - 1) && node.y < (nodeMap.length - 1) && nodeMap[node.y + 1][node.x + 1]) {
                neighbors.push(nodeMap[node.y + 1][node.x + 1]);
            }

            if (node.x > 0 && node.y < (nodeMap.length - 1) && nodeMap[node.y + 1][node.x - 1]) {
                neighbors.push(nodeMap[node.y + 1][node.x - 1]);
            }
        }

        return neighbors;
    }

    function init(map) {
        time = Date.now();
        startNode = null;
        targetNode = null;
        openList = [];
        closedList = [];
        cameFrom = {};
        nodeMap = parseMap(map);
        startNode.cost = 0;
        startNode.heuristic = getHeuristic(startNode);
    }

    function parseMap(map) {
        let parsedMap = map.map((line, y) => {
            return line.map((content, x) => {

                if (content === '#') {
                    return null;
                }

                let node = new Node(x, y);

                if (content === 'C') {
                    startNode = node;
                } else if (content === 'O') {
                    targetNode = node;
                }

                return node;
            });
        });

        if (!startNode || !targetNode) {
            throw Error('Start position or target not found');
        }

        return parsedMap;
    }

    function reconstructPath(pathCallback) {
        let count = 0;
        let current = targetNode;

        let id = setInterval(() => {

            if (!cameFrom[current.x + '-' + current.y]) {
                console.log('AStart:' + heuristicType + '-> cost: ' + count);
                return clearInterval(id);
            }

            current = cameFrom[current.x + '-' + current.y];
            count++;
            pathCallback(current.x, current.y);
        }, 10);
    }

    function unstackOpenList() {

        let index = openList.reduce((bestNodeIndex, node, index) => {
            return !bestNodeIndex || openList[index].heuristic < openList[bestNodeIndex].heuristic ? index : bestNodeIndex;
        }, null);

        let node = openList[index];
        openList.splice(index, 1);

        return node;
    }

    function Node(x, y, cost, heuristic) {
        this.x = x | 0;
        this.y = y | 0;
        this.cost = cost | Number.MAX_VALUE;
        this.heuristic = heuristic | Number.MAX_VALUE;
    }

    Node.prototype.clone = function () {
        return new Node(this.x, this.y, this.cost, this.heuristic);
    };
};