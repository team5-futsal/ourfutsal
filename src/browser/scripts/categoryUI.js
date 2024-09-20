/** API 호출 이후 UI에 관련된 함수 모음입니다.
 * 혹은 UI 관련 로직을 수행합니다.
 */
import { handleApiButtonClick } from './utils.js';
import { getAccountAll, getPlayerDetail, getPlayers, updateAccount } from './api.js';
// import { getAccounts } from './api.js';

// 카테고리에 있는 각 API 버튼에 이벤트 리스너 추가
document.querySelectorAll('[type="apiForm"] button').forEach(button => {
    button.addEventListener('click', handleApiButtonClick);
});


document.body.addEventListener('click', function(event) {
    // 클릭된 요소의 ID가 'ResSendBtn'으로 끝나는지 확인
    if (event.target && event.target.id.endsWith('ResSendBtn')) {
        // sendRequest 버튼이 클릭된 경우 처리
        handleSendRequest(event);
    }
});


function handleSendRequest(event) {
    event.preventDefault();

    const sendRequestBtn = event.target;
    const params = document.getElementById('reqParams').value;
    const body = document.getElementById('reqBody').value;

    // 버튼 ID에 따라 API 요청을 구분
    switch (sendRequestBtn.id) {
        case 'getAccountsResSendBtn':
            getAccountAll().then(res => {
                const apiResDiv = document.querySelector('.apiRes');
                const resContext = document.createElement('div');

                for (let i in res.data) {
                    const userId = res.data[i].userId;
                    const createdAt = res.data[i].createdAt;
                    const btnId = res.data[i].userId;

                    resContext.innerHTML += `
                    <p class="users">userId: ${userId}, createdAt: ${createdAt}</p>
                    <br>
                    `;
                }
                apiResDiv.appendChild(resContext);
            });
            break;

        case 'updateAccountsResSendBtn':
            updateAccount(params).then(res => {
                const apiResDiv = document.querySelector('.apiRes');
                const resContext = document.createElement('div');

                resContext.innerHTML = `
                <p class="users">${res.data}</p>
                `;
                apiResDiv.appendChild(resContext);
            });
            break;

        case 'getPlayersResSendBtn' :
            getPlayers().then(res => {

                const apiResDiv = document.querySelector('.apiRes');
                const resContext = document.createElement('div');

                for (let i in res.data) {
                    const playerName = res.data[i].playerName;
                    const position = res.data[i].positionId;

                    resContext.innerHTML += `
                <p class="users">선수명 : ${playerName}<br> 포지션 : ${position} </p>
                <br>
                `;
                }
                apiResDiv.appendChild(resContext);
            });
            break;

        case 'getPlayerDetailResSendBtn' :
            getPlayerDetail(params).then(res => {
                const player = res.data
                const playerName = res.data.playerName;
                const positionId = res.data.positionId;
                const playerStrength = res.data.playerStrength;
                const playerDefense = res.data.PlayerDefense;
                const playerStamina = res.data.playerStamina;
                const apiResDiv = document.querySelector('.apiRes');
                const resContext = document.createElement('div');

                resContext.innerHTML = `
                <p class="users">선수명 : ${playerName} <br> 포지션 아이디 : ${positionId} <br> 공격력 : ${playerStrength} <br> 수비력 : ${playerDefense} <br> 스테미나 : ${playerStamina}</p>
                `;
                apiResDiv.appendChild(resContext);
            });
            break;

        // 다른 API 요청을 추가로 처리할 수 있음
        default:
            console.log('이 버튼에 해당하는 API 기능이 없습니다');
    }
}