angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

    })

    .controller('HomeCtrl', function ($scope, $timeout, $window) {

        var DIRECTIONS = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        };

        var COLORS = {
            GAME_OVER: '#820303',
            FRUIT: '#E80505',
            SNAKE_HEAD: '#078F00',
            SNAKE_BODY: '#0DFF00',
            BOARD: '#000'
        };

        var BOARD_SIZE = 20;

        var interval, tempDirection, isGameOver, gameRunning;

        var snake = {
            direction: DIRECTIONS.LEFT,
            parts: [{
                x: -1,
                y: -1
            }]
        };

        var fruit = {
            x: -1,
            y: -1
        };

        $scope.setStyling = function (col, row) {
            // console.log(col, row)
            if ($scope.isGameOver) {
                return COLORS.GAME_OVER;
            } else if (fruit.x == row && fruit.y == col) {
                return COLORS.FRUIT;
            } else if (snake.parts[0].x == row && snake.parts[0].y == col) {
                return COLORS.SNAKE_HEAD;
            } else if ($scope.board[col][row] === true) {
                return COLORS.SNAKE_BODY;
            }
            return COLORS.BOARD;
        };

        function setupBoard() {
            $scope.board = [];
            for (var i = 0; i < BOARD_SIZE; i++) {
                $scope.board[i] = [];
                for (var j = 0; j < BOARD_SIZE; j++) {
                    $scope.board[i][j] = false;
                }
            }
        }
        setupBoard();

        function resetFruit() {
            var x = Math.floor(Math.random() * BOARD_SIZE);
            var y = Math.floor(Math.random() * BOARD_SIZE);

            if ($scope.board[y][x] === true) {
                return resetFruit();
            }
            fruit = { x: x, y: y };
        }

        function update() {
            var newHead = getNewHead();

            if (boardCollision(newHead) || selfCollision(newHead)) {
                return gameOver();
            } else if (fruitCollision(newHead)) {
                eatFruit();
            }

            // Remove tail
            var oldTail = snake.parts.pop();
            $scope.board[oldTail.y][oldTail.x] = false;

            // Pop tail to head
            snake.parts.unshift(newHead);
            $scope.board[newHead.y][newHead.x] = true;

            // Do it again
            snake.direction = tempDirection;
            $timeout(update, interval);
        }

        function getNewHead() {
            var newHead = angular.copy(snake.parts[0]);

            // Update Location
            if (tempDirection === DIRECTIONS.LEFT) {
                newHead.x -= 1;
            } else if (tempDirection === DIRECTIONS.RIGHT) {
                newHead.x += 1;
            } else if (tempDirection === DIRECTIONS.UP) {
                newHead.y -= 1;
            } else if (tempDirection === DIRECTIONS.DOWN) {
                newHead.y += 1;
            }
            return newHead;
        }

        function boardCollision(part) {
            return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
        }

        function selfCollision(part) {
            return $scope.board[part.y][part.x] === true;
        }

        function fruitCollision(part) {
            return part.x === fruit.x && part.y === fruit.y;
        }

        function gameOver() {
            $scope.isGameOver = true;

            $timeout(function () {
                $scope.isGameOver = false;
                $scope.gameRunning = false;
            }, 2000);

            setupBoard();
        }

        $window.addEventListener("keydown", function (e) {
            if (!$scope.isGameOver && !$scope.gameRunning && e.keyCode == 13) {
                $scope.startGame();
            } else {
                changeDirection(e.keyCode);
            }
        });

        function changeDirection (keyCode) {
            if (keyCode == DIRECTIONS.LEFT && snake.direction !== DIRECTIONS.RIGHT) {
                tempDirection = DIRECTIONS.LEFT;
            } else if (keyCode == DIRECTIONS.UP && snake.direction !== DIRECTIONS.DOWN) {
                tempDirection = DIRECTIONS.UP;
            } else if (keyCode == DIRECTIONS.RIGHT && snake.direction !== DIRECTIONS.LEFT) {
                tempDirection = DIRECTIONS.RIGHT;
            } else if (keyCode == DIRECTIONS.DOWN && snake.direction !== DIRECTIONS.UP) {
                tempDirection = DIRECTIONS.DOWN;
            }
        };

        $scope.swipeEvent = function (e) {
            if (e && e.gesture) {
                switch (e.gesture.direction) {
                    case 'left':
                        changeDirection(37);
                        break;
                    case 'up':
                        changeDirection(38);
                        break;
                    case 'right':
                        changeDirection(39);
                        break;
                    case 'down':
                        changeDirection(40);
                        break;
                }
            }
        }

        function eatFruit() {
            $scope.score++;

            // Grow by 1
            var tail = angular.copy(snake.parts[snake.parts.length - 1]);
            snake.parts.push(tail);
            resetFruit();

            if ($scope.score % 5 === 0) {
                interval -= 15;
            }
        }


        $scope.startGame = function () {
            if ($scope.isGameOver) {
                return false;
            } else {
                $scope.score = 0;
                $scope.gameRunning = true;
                snake = { direction: DIRECTIONS.LEFT, parts: [] };
                tempDirection = DIRECTIONS.LEFT;
                $scope.isGameOver = false;
                interval = 150;

                // Set up initial snake
                for (var i = 0; i < 5; i++) {
                    snake.parts.push({ x: 10 + i, y: 10 });
                }

                resetFruit();
                update();
            }
        };

    })
