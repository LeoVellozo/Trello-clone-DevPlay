let boards = [];
let tasks = [];
let formattedBoard = [];
const boardsIds = {};
const boardObjs = [];

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

function makeBoardTitle(title, id){
    return `<input type='text' value='${title}' class='inputEdit' id='input${id}' data-id='${id}' /> <span id='title${id}' class='boardTitle' data-id='${id}'>${title}</span> <i class='bi-pencil btnRight btnEditTitle' data-id='${id}'></i> <br style='clear:both' />`;
}

function makeTaskTitle(title, id){
  return `${title} <i class='bi-trash btnRight btnRemoveTask' data-id='${id}'></i>`;
}

function deleteTask(taskId){
  KanbanTest.removeElement(taskId);
}

function buildRemoveTask(){
  let btnsRemoveTask = document.getElementsByClassName("btnRemoveTask");
  for (let index = 0; index < btnsRemoveTask.length; index++) {
    const btnRemoveTask = btnsRemoveTask[index];

    btnRemoveTask.addEventListener("click", function(){
      Swal.fire({
          title: 'Você tem certeza?',
          text: "Está ação é irreversível!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sim, Remover',
          cancelButtonText: 'Cancelar'
      }).then((result) => {
            if (result.isConfirmed) {
              const dataId = this.getAttribute('data-id');
              deleteTask(dataId);

              Toast.fire({
                  icon: 'success',
                  title: 'Tarefa apagada com sucesso!'
              });            
            }
        })

    })
  }
}




var KanbanTest = new jKanban({
    element: "#trello",
    gutter: "10px",
    widthBoard: "450px",
    itemHandleOptions:{
      enabled: true,
    },
    click: function(el) {
      console.log("Trigger on all items click!");
    },
    context: function(el, e) {
      console.log("Trigger on all items right-click!");
    },
    dropEl: function(el, target, source, sibling){
      console.log(target.parentElement.getAttribute('data-id'));
      console.log(el, target, source, sibling)
    },
    buttonClick: function(el, boardId) {
      console.log(el);
      console.log(boardId);
      // create a form to enter element
      var formItem = document.createElement("form");
      formItem.setAttribute("class", "itemform");
      formItem.innerHTML =
        '<div class="form-group"><textarea class="form-control" rows="2" autofocus></textarea></div><div class="form-group"><button type="submit" class="btn btn-primary btn-xs pull-right">Submit</button><button type="button" id="CancelBtn" class="btn btn-default btn-xs pull-right">Cancel</button></div>';

      KanbanTest.addForm(boardId, formItem);
      formItem.addEventListener("submit", function(e) {
        e.preventDefault();
        var text = e.target[0].value;
        KanbanTest.addElement(boardId, {
          title: text
        });
        formItem.parentNode.removeChild(formItem);
      });
      document.getElementById("CancelBtn").onclick = function() {
        formItem.parentNode.removeChild(formItem);
      };
    },
    itemAddOptions: {
      enabled: true,
      content: '+ Add New Card',
      class: 'custom-button',
      footer: true
    },
    boards: [
      
    ]
  });

  

  const getBoards = async () => {
    try {
        await axios.get('functions/index.php', { params: { type: "read_boards" }, }, { headers: { 'Content-Type': 'application/json'}})
          .then(function (response) {
              boards = response.data;

              if (boards) {

                  for (const board in boards) {
                      let ref = boards[board].ref
                      let boardId = boards[board].id
                      boardsIds[ref] = boardId;
                      boardsIds[boardId] = ref;

                      KanbanTest.addBoards([
                      {
                          id: boards[board].ref,
                          title: makeBoardTitle(boards[board].title, boards[board].ref),
                          class: boards[board].class,
                          dragTo: boards[board].dragTo,
                          item: []
                      }
                      ]);                  
                      buildEditTitle();                  
                  }

                  // getTasks();
              }
          });
    } catch (err) {
        console.error(err)
    }
}

  getBoards();

  buildRemoveTask();

  const searchInput = document.getElementById("search");

  var delayTimer;

  searchInput.addEventListener("input", function(){

    const searchTerm = this.value;
    const getTasks = document.getElementsByClassName("task")

    delayTimer = setTimeout(function() {

      for (let i = 0; i < getTasks.length; i++) {        
        const taskTitle = getTasks.item(i).getAttribute("data-task-title");
        getTasks[i].style.display = "none";

        if (searchTerm != "" && (taskTitle.toLowerCase()).includes(searchTerm.toLowerCase())) {
          getTasks[i].style.display = "block"
        }
        
        if (searchTerm == "") {
          getTasks[i].style.display = "block"
        }
      }
      
    }, 500)
  })


  var addBoardDefault = document.getElementById("addDefault");
  addBoardDefault.addEventListener("click", function() {

    const createBoard = async () => {
      try {

        await axios.post("functions/index.php", null, { params: { type: "create_board" }}, { headers: { 'Content-type': 'application/json'}})

      } catch (err) {

      }
    }

    createBoard();
  });

  function buildEditTitle(){
    var btnsEditTitle = document.getElementsByClassName('btnEditTitle');
    for (let index = 0; index < btnsEditTitle.length; index++) {
        const btnEditTitle = btnsEditTitle[index];

        btnEditTitle.addEventListener("click", function() {
        const dataId = this.getAttribute('data-id');
        document.getElementById('title'+dataId).style.display = 'none';
        document.getElementById('input'+dataId).style.display = 'block';
        document.getElementById('input'+dataId).focus();
        });    
        
    }

    var elements = document.getElementsByClassName("inputEdit");

    var myFunction = function () {
        const dataId = this.getAttribute('data-id');
        const newValue = this.value;
        document.getElementById('title' + dataId).innerHTML = newValue;
        document.getElementById('title' + dataId).style.display = 'block';
        document.getElementById('input' + dataId).style.display = 'none';

        updateBoard(dataId, newValue);
    };

    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('blur', myFunction, false);
    }

}

  