const xhr = new XMLHttpRequest();

function registry(){
    const login = document.getElementById('login').value;
    const pass = document.getElementById('pass').value;
    const passConfirm = document.getElementById('passConfirm').value;

    if(!login || !pass || !passConfirm){
        alert("Заполните все поля!");
        return
    }

    if (pass !== passConfirm){
        alert('Пароли не совпадают!');
        return
    }

    xhr.open('POST', '/registry', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    let data = {
        login: login,
        password: pass
    };
    xhr.send(JSON.stringify(data));
    xhr.onreadystatechange = function(){
        if (xhr.readyState != 4) return;
        if (xhr.response === 'existed'){
            alert('Такой пользователь уже существует!')
        } else if (xhr.response === 'success'){
            localStorage.setItem('login', login);
            localStorage.setItem('password', pass);
            document.location.href = '/tdl.html';
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