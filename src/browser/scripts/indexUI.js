/** 
 * API 호출 이후 UI에 관련된 함수 모음입니다.
 * 혹은 UI 관련 로직을 수행합니다.
 */

import { loginAccount } from './api.js';

window.addEventListener('DOMContentLoaded', function () {
    /** 로그인 버튼 기능 함수 */
    document.getElementById('confirmBtn').addEventListener('click', function (event) {
        event.preventDefault();

        const userId = document.getElementById('userId').value;
        const password = document.getElementById('password').value;

        const body = { userId, password };
        loginAccount(body).then(data => {
            if (data.isLogin === true) {
                localStorage.setItem('accessToken', data.accessToken);
                window.location.href = `http://localhost:3333/api/category`;
                
            } else {
                // location.reload(true);
            }
        });
    });

    document.getElementById('registBtn').addEventListener('click', function (event) {
        event.preventDefault();

        window.location.href = 'http://localhost:3333/api/join';
    });
});
