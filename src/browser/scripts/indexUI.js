/** API 호출 이후 UI에 관련된 함수 모음입니다.
 * 혹은 UI 관련 로직을 수행합니다.
 */
import { loginAccount } from './api.js';
import { handleApiButtonClick } from './utils.js';

/** 로그인 버튼 기능 함수 */
document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    const body = { userId, password };

    loginAccount(body).then(res => {
        if (res.isLogin === true) {
            window.location.href = 'http://localhost:3333/api/category';
        } else if (res.isLogin === false) {
        }
    });
});