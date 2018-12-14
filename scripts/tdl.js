'use strict';
var arr = [];
const xhr = new XMLHttpRequest();

xhr.open('GET', '/getList', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
xhr.send();

xhr.onreadystatechange = function(){
    if (xhr.readyState != 4) return;
    if (xhr.status === 401) { document.location.href = '/'}
    let resp = JSON.parse(xhr.response);
    arr = resp.data;
    localStorage.setItem('idCounter', resp.idCounter);
    let uList = document.getElementById('list');
    arr.forEach(function (value) {
        let oldLi = createLi(value);
        uList.appendChild(oldLi);
    });
};

//создание нового элемента массива и добавление его в список
function newItem(className = 'list-group-item') {
    const item = document.getElementById("input").value;
    if(!item.match(/\S/)){
        return
    }
    let id = parseInt(localStorage.getItem('idCounter'))
    let it = {
        id: id,
        completed: false,
        text: '- ' + item,
        className: className
    };
    let li = createLi(it);
    let ul = document.getElementById('list');
    arr.push(it);
    //localStorage.setItem('liData', JSON.stringify(arr));
    id++;
    localStorage.setItem('idCounter', id);
    document.getElementById("input").value = ""; //чистка поля ввода
    ul.appendChild(li);
}

//создание элемента списка
function createLi(data) {
    let li = document.createElement('li');
    li.innerText = data.text;
    li.id = data.id;
    li.complete = data.completed;
    li.className = data.className;
    if(li.complete){
        li.classList.add('disabled')
    }
    li.onclick = changeStatus;  //интерактивность по клику

    //у каждого элемента списка есть своя кнопка удаления
    let button = document.createElement('button');
    button.className = 'btn btn-danger personal close';
    button.onclick = deleteElement;
    button.innerText = 'x';
    li.appendChild(button);
    return li
}

//удаление элемента списка по кнопке
function deleteElement() {
    let liId = parseInt(this.parentElement.id);
    arr.splice((arr.findIndex(x => x.id === liId)), 1);
    //localStorage.setItem('liData', JSON.stringify(arr));
    this.parentElement.remove();
}

//инициализация элемента по нажатию Enter
document.body.onkeyup = function (e) {
    if (e.keyCode === 13) {
        newItem();
    }
};

//изменение статуса задачи
function changeStatus() {
    let liId = parseInt(this.id);
    let elem = (arr.find(x => x.id === liId));
    if (this.complete && elem) {
        elem.completed = false;
        this.classList.remove('disabled')
        elem.className = this.className;
    } else if (elem){
        elem.completed = true;
        this.classList.add('disabled');
        elem.className = this.className;
    }
    //localStorage.setItem('liData', JSON.stringify(arr));
    this.complete = !this.complete;

}

//фильтрация отображения элементов списка
function listFilter(type) {
    let ul = document.getElementById('list');
    let Classes = ul.className.split(' ');
    if (Classes[0] === 'ulDone' || Classes[0] === 'ulUndone') {
        Classes[0] = '';
    }
    if (type === 'completed') {
        ul.className = 'ulDone ' + Classes.join(' ');
        document.getElementById('doneBtn').classList.add('choosed');
        document.getElementById('undoneBtn').classList.remove('choosed');
        document.getElementById('allBtn').classList.remove('choosed')

    } else if (type === 'uncompleted') {
        ul.className = 'ulUndone ' + Classes.join(' ');
        document.getElementById('doneBtn').classList.remove('choosed');
        document.getElementById('undoneBtn').classList.add('choosed');
        document.getElementById('allBtn').classList.remove('choosed');

    } else if (type === 'all') {
        ul.className = Classes.join(' ');
        document.getElementById('doneBtn').classList.remove('choosed');
        document.getElementById('undoneBtn').classList.remove('choosed');
        document.getElementById('allBtn').classList.add('choosed')
    }
    //localStorage.setItem('filterStatus', type);
}

//удаление всех выполненных задач
function deleteCompleted() {
    arr = arr.filter(function (value) {
        return !value.completed
    });
    //localStorage.setItem('liData', JSON.stringify(arr));
    let ul = document.getElementById('list');
    let list = ul.childNodes;

    //при удалении через forEach смещаются индексы
    let elem = 0;
    while (elem < list.length) {
        if (list[elem].complete) {
            ul.removeChild(list[elem])
        } else {
            elem++
        }
    }
}

function deleteAll() {
    arr = [];
    //localStorage.clear();
    let ul = document.getElementById('list');
    while(ul.firstChild){
        ul.removeChild(ul.firstChild)
    }
}

function sendToServer(){
    let data = {
        data: arr,
        idCounter: localStorage.getItem('idCounter')
    };
    xhr.open('POST', '/tdl', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
    xhr.send(JSON.stringify(data))
}