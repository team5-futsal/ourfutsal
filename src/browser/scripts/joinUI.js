/** API 호출 이후 UI에 관련된 함수 모음입니다.
 * 혹은 UI 관련 로직을 수행합니다.
 */
import { registAccount } from './api.js';

window.addEventListener('DOMContentLoaded', function () {
    /** 돌아가기 */
    document.getElementById('backBtn').addEventListener('click', function (event) {
        event.preventDefault();

        window.location.href = 'http://localhost:3333/';
    });

    /** 회원가입 확인 */
    document.getElementById('confirmBtn').addEventListener('click', function (event) {
        event.preventDefault();

        const userId = document.getElementById('userId').value;
        const password = document.getElementById('password').value;
        const passwordConfirmation = document.getElementById('passwordConfirmation').value;

        if (password !== passwordConfirmation) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        const body = { userId, password };

        registAccount(body).then(res => {
            if (!res) {
                return;
            }
            window.location.href = 'http://localhost:3333/';
        });
    });
});
