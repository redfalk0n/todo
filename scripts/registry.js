const xhr = new XMLHttpRequest();

function registry(){
    const username = document.getElementById('login').value;
    const pass = document.getElementById('pass').value;
    const passConfirm = document.getElementById('passConfirm').value;

    if(!username || !pass || !passConfirm){
        alert("Заполните все поля!");
        return
    }

    if (pass !== passConfirm){
        alert('Пароли не совпадают!');
        return
    }

    xhr.open('POST', '/registry', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    let data = 'username=' + encodeURIComponent(username) +
        '&password=' + encodeURIComponent(pass);
    xhr.send(data);
    xhr.onreadystatechange = function(){
        if (xhr.readyState != 4) return;
        if (xhr.response === 'Unauthorized'){
            alert('Такой пользователь уже существует!')
        } else if (xhr.response){
            localStorage.setItem('token', xhr.response);
            document.location.href = '/tdl';
        } else {
            alert('Неизвестная ошибка!')
        }
    };
}

document.body.onkeyup = function (e) {
    if (e.keyCode === 13) {
        registry();
    }
};