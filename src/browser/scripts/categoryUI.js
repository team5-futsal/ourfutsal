/** API 호출 이후 UI에 관련된 함수 모음입니다.
 * 혹은 UI 관련 로직을 수행합니다.
 */
import { handleApiButtonClick } from './utils.js';
import {
    getAccountAll,
    getAccountInfo,
    updateAccount,
    deleteAccount,
    logoutAccount,
    getTeam,
    getUserTeam,
    excludeTeam,
    excludeTeamAll,
    updateTeam,
} from './api.js';

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
                    <p>userId: ${userId}, createdAt: ${createdAt}</p>
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
                alert(`접속한 ${userId}가 정상적으로 삭제되었습니다. 로그인 화면으로 이동합니다.`);
                // 삭제가 되었으니 페이지를 기본 홈으로 이동
                window.location.href = 'http://localhost:3333/api';
                window.localStorage.clear();
            });
            break;

        case 'logoutAccountResSendBtn':
            logoutAccount().then(res => {
                alert('로그아웃 되었습니다. 로그인 화면으로 이동합니다.');
                window.location.href = 'http://localhost:3333/api';
                window.localStorage.clear();
            });
            break;

        // 내 팀 편성 조회
        case 'getTeamResSendBtn':
            getTeam().then(res => {
                const selectDiv = document.querySelector('.apiRes');

                let content = '';

                window.excludePlayer = async playerId => {
                    //확인창 출력
                    if (confirm('이 선수를 편성에서 제외 하시겠습니까? ')) {
                        excludeTeam(playerId);
                        alert('해당 선수가 편성에서 제외되었습니다. ');
                        getTeam();
                    }
                };

                for (let i in res) {
                    content += `<div class="myPlayer('${res[i].playerId}')">${res[i].playerName}     <button class="player" onclick="infoPlayer('${res[i].playerId}')" >상세 조회(미구현)</button>    <button class="player" onclick="excludePlayer('${res[i].playerId}')">편성 제외</button><br><br><br></div>`;
                }

                // // 상세보기 구현방법을 모르겠습니다
                // // querySelector 가 안되는 현상
                // window.infoPlayer = async playerId => {
                //     const div = document.querySelector(`.myPlayer${playerId}`);
                //     div.innerHTML = `${JSON.stringify(res)}`;
                // };

                selectDiv.innerHTML = content;
            });
            break;

        // 다른 유저의 편성 조회
        case 'getUserTeamResSendBtn':
            let content = '';
            const param = document.getElementById('reqParams').value;

            getUserTeam(param).then(res => {
                for (let i in res) {
                    content += `<div>${res[i].playerName}</div><br><br><br>`;
                }

                apiResDiv.innerHTML = content;
            });
            break;

        // 내 팀 편성 제외
        case 'excludeTeamResSendBtn':
            if (confirm(`playerId = ${body} 선수를 편성에서 제외 하시겠습니까? `)) {
                excludeTeam(body).then(res => {
                    apiResDiv.textContent = res.message;
                });
            }
            break;

        // 내 팀 편성 모두 제외
        case 'excludeTeamAllResSendBtn':
            if (confirm(`모든 선수를 편성에서 제외 하시겠습니까? `)) {
                excludeTeamAll().then(res => {
                    apiResDiv.textContent = res.message;
                });
            }
            break;

        // 내 팀 편성 추가
        case 'updateTeamResSendBtn':
            if (confirm(`playerId = ${body} 선수를 편성에 추가합니까? `)) {
                updateTeam(body).then(res => {
                    apiResDiv.textContent = res.message;
                });
            }
            break;

        // 다른 API 요청을 추가로 처리할 수 있음
        default:
            console.log('이 버튼에 해당하는 API 기능이 없습니다');
    }
}
