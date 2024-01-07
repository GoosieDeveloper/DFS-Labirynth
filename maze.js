// DEPTH FIRST SEARCH MAZE IMPLEMENTATION IN JAVASCRIPT BY CONOR BAILEY


let maze = document.querySelector(".maze");
let ctx = maze.getContext("2d");
let generationComplete = false;

let current;
let goal;

class Maze {
  constructor(size, rows, columns) {
    this.size = size;
    this.columns = columns;
    this.rows = rows;
    this.grid = [];
    this.stack = [];
  }

  // Tworzenie labiryntu (wiersze/kolumny)
  setup() {
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; c++) {
        // Stwórz siatkę labiryntu
        let cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }
    // Ustaw siatkę startową
    current = this.grid[0][0];
    this.grid[this.rows - 1][this.columns - 1].goal = true;
  }

  // Rysowanie labiryntu
  draw() {
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = "black";
    // Ustaw pierwszą komurkę jako wyświetloną
    current.visited = true;
    // Przejdź przez każdą komurkę oraz wypełnij ścieżkę labiryntu
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let grid = this.grid;
        grid[r][c].show(this.size, this.rows, this.columns);
      }
    }
    // Przpypisz funkcję "next" do losowej komórki z aktualnie dostępnych komórek sąsiednich
    let next = current.checkNeighbours();
    // Jeśli nie ma odwiedzonej sąsiedniej komórki
    if (next) {
      next.visited = true;
      // Dodaj bieżącą komórkę do stosu w celu wycofania
      this.stack.push(current);
      // Podświetla bieżącą komórkę
      // Ustal rozmiar komórki
      current.highlight(this.columns);
      // Porównaj bieżącą komórkę z następnąkomórką i usuń odpowiednie ściany
      current.removeWalls(current, next);
      // Set the nect cell to the current cell
      current = next;

      // Jeśli nie ma dostępnych sąsiadów, wycofaj się za pomocą stosu
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();
      current = cell;
      current.highlight(this.columns);
    }
    // Jeśli nie ma więcej elementów, stos się skończyl - wyjdź z funkcji
    if (this.stack.length === 0) {
      generationComplete = true;
      return;
    }

    // Rekurencyjnie wywołaj funkcję "draw" dopóki stos nie będzie pusty
    window.requestAnimationFrame(() => {
      this.draw();
    });
    //     setTimeout(() => {rd
    //       this.draw();
    //     }, 10);
  }
}

class Cell {
  // Pobierz rowNum oraz colNu, które będą używane jako współrzędne do rysowania labiryntu
  constructor(rowNum, colNum, parentGrid, parentSize) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.visited = false;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
    this.goal = false;
    // parentGrid jest przekazywane, aby włączyć metodą checkNeighbour
    // parentSize jest przekazywane, aby ustawić rozmiar każdej komórki w siatce
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
  }

  checkNeighbours() {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let neighbours = [];

    // Wypchnij wszystkich dostępnych sąsiadów do tablicy sąsiadów
    // undefined jest zwracany, gdy indeks jest poza zakresem (brzegi labiryntu)
    let top = row !== 0 ? grid[row - 1][col] : undefined;
    let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
    let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let left = col !== 0 ? grid[row][col - 1] : undefined;

    // Jeśli elementy nie są "undefined" wepchnij je do tablicy
    if (top && !top.visited) neighbours.push(top);
    if (right && !right.visited) neighbours.push(right);
    if (bottom && !bottom.visited) neighbours.push(bottom);
    if (left && !left.visited) neighbours.push(left);

    // Wybierz losowego sąsiada z tablicy sąsiadów
    if (neighbours.length !== 0) {
      let random = Math.floor(Math.random() * neighbours.length);
      return neighbours[random];
    } else {
      return undefined;
    }
  }

  // Fukcja do rysowania ścian, jeśli komórka ma wartość "true"
  drawTopWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / columns, y);
    ctx.stroke();
  }

  drawRightWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + size / columns, y);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawBottomWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / rows);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawLeftWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size / rows);
    ctx.stroke();
  }

  // Podświetlenie aktualnej komórki
  highlight(columns) {
    // Podświetlanie ścian aktualnej komórki
    let x = (this.colNum * this.parentSize) / columns + 1;
    let y = (this.rowNum * this.parentSize) / columns + 1;
    ctx.fillStyle = "purple";
    ctx.fillRect(
      x,
      y,
      this.parentSize / columns - 3,
      this.parentSize / columns - 3
    );
  }

  removeWalls(cell1, cell2) {
    // Porównaj 2 komórki na osi X
    let x = cell1.colNum - cell2.colNum;
      // Usuń odpowiednie ściany, jeśli są inne na osi X
    if (x === 1) {
      cell1.walls.leftWall = false;
      cell2.walls.rightWall = false;
    } else if (x === -1) {
      cell1.walls.rightWall = false;
      cell2.walls.leftWall = false;
    }
    // Porównaj 2 komórki na osi Y
    let y = cell1.rowNum - cell2.rowNum;
    // Usuń odpowiednie ściany, jeśli są inne na osi Y
    if (y === 1) {
      cell1.walls.topWall = false;
      cell2.walls.bottomWall = false;
    } else if (y === -1) {
      cell1.walls.bottomWall = false;
      cell2.walls.topWall = false;
    }
  }

  // Rysowanie każdej komórki w labiryncie
  show(size, rows, columns) {
    let x = (this.colNum * size) / columns;
    let y = (this.rowNum * size) / rows;
    // console.log(`x =${x}`);
    // console.log(`y =${y}`);
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;
    if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
    if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
    if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows);
    if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
    if (this.visited) {
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
    if (this.goal) {
      ctx.fillStyle = "rgb(83, 247, 43)";
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
  }
}

// let newMaze = new Maze(600, 50, 50);
// newMaze.setup();
// newMaze.draw();