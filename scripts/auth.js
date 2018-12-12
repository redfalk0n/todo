const xhr = new XMLHttpRequest();

function auth(){
    let login = document.getElementById('login').value;
    let pass = document.getElementById('pass').value;
    xhr.open('POST', '/auth', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    let data = {
        login: login,
        password: pass
    };
    xhr.send(JSON.stringify(data));
    xhr.onreadystatechange = function(){
        if (xhr.readyState != 4) return;
        if (xhr.response === 'no data'){
            alert('Неправильный логин или пароль!')
        } else if (xhr.response === 'valid data'){
            localStorage.setItem('login', login);
            localStorage.setItem('password', pass);
            document.location.href = '/tdl';
        } else {
            alert('Неизвестная ошибка!')
        }
    };
}

document.body.onkeyup = function (e) {
    if (e.keyCode === 13) {
        auth();
    }
};