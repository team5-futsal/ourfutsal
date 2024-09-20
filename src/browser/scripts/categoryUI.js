/** API 호출 이후 UI에 관련된 함수 모음입니다.
 * 혹은 UI 관련 로직을 수행합니다.
 */
import { handleApiButtonClick } from './utils.js';
import { getAccountAll, getAccountInfo, updateAccount, deleteAccount } from './api.js';

// 카테고리에 있는 각 API 버튼에 이벤트 리스너 추가
document.querySelectorAll('[type="apiForm"] button').forEach(button => {
    button.addEventListener('click', handleApiButtonClick);
});

document.body.addEventListener('click', function (event) {
    // 클릭된 요소의 ID가 'ResSendBtn'으로 끝나는지 확인
    if (event.target && event.target.id.endsWith('ResSendBtn')) {
        const apiResDiv = document.getElementById('apiRes');
        apiResDiv.children.textContext = '';
        // sendRequest 버튼이 클릭된 경우 처리
        handleSendRequest(event);
    }
});

function handleSendRequest(event) {
    event.preventDefault();

    const sendRequestBtn = event.target;

    const apiResDiv = document.querySelector('.apiRes');

    // Response에 출력하기 전 비워주기
    apiResDiv.innerHTML = ``;
    const resContext = document.createElement('div');

    const params = document.getElementById('reqParams').value;
    const body = document.getElementById('reqBody').value;

    // 버튼 ID에 따라 API 요청을 구분
    switch (sendRequestBtn.id) {
        case 'getAccountsResSendBtn':
            getAccountAll().then(res => {
                for (let i in res.data) {
                    const userId = res.data[i].userId;
                    const createdAt = res.data[i].createdAt;

                    resContext.innerHTML += `
                    <p class="users">userId: ${userId}, createdAt: ${createdAt}</p>
                    <br>
                    `;
                }
                apiResDiv.appendChild(resContext);
            });
            break;

        case 'updateAccountResSendBtn':
            updateAccount(body).then(res => {
                alert(`접속한 유저의 비밀번호가 수정되었습니다. 로그인 화면으로 이동합니다.`);
                // window.location.href = 'http://localhost:3333/api'
                // window.localStorage.clear()
            });
            break;

        case 'getAccountResSendBtn':
            getAccountInfo().then(res => {
                const userId = res.data.userId;
                const createdAt = res.data.createdAt;

                resContext.innerHTML += `
                    <p class="users">userId: ${userId}, createdAt: ${createdAt}</p>
                    <br>
                    `;

                apiResDiv.appendChild(resContext);
            });
            break;

            case 'deleteAccountResSendBtn':
                deleteAccount().then(res => {
                    const userId = res.data.userId;
                    alert(`접속한 ${userId}가 정상적으로 삭제되었습니다. 로그인 화면으로 이동합니다.`)
                    // 삭제가 되었으니 페이지를 기본 홈으로 이동
                    window.location.href = 'http://localhost:3333/api'
                    window.localStorage.clear()
                })

        // 다른 API 요청을 추가로 처리할 수 있음
        default:
            console.log('이 버튼에 해당하는 API 기능이 없습니다');
    }
}
