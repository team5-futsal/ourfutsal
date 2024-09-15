// 로그인 버튼 기능 함수
export function login_confirm() {
    const userId = document.getElementById('id').value;
    const password = document.getElementById('password').value;

    const btn = document.getElementById('confirmBtn');


    // 버튼 입력한 경우 fetch로 API 호출
    const apiURL =`${process.env.OUR_DEV_ADDRESS}/account/login`;

    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
    }

    fetch(apiURL, config).then(response => response.json())

    // // AJAX 요청
    // const xhr = new XMLHttpRequest();
    // xhr.open('POST', '/api/users/login', true);
    // xhr.setRequestHeader('Content-Type', 'application/json');
    // xhr.send(JSON.stringify({ userId, password }));
}
