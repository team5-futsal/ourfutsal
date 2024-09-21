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
    getMyPlayer,
    getPlayerDetail,
    getPlayers,
    sellMyPlayer,
    enhancePlayer,
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
                if (res.message) {
                    resContext.innerHTML = res.message;
                    apiResDiv.appendChild(resContext);
                    return;
                }

                window.excludePlayer = async playerId => {
                    if (confirm('이 선수를 편성에서 제외 하시겠습니까? ')) {
                        excludeTeam(playerId);
                        alert('해당 선수가 편성에서 제외되었습니다. ');
                    }
                };

                window.infoPlayer = async i => {
                    const div = document.getElementById(`myPlayer('${i}')`);
                    div.innerHTML = '';
                    div.innerHTML += `
                     파워 : ${res[i].playerStrength}&nbsp 
                     수비력: ${res[i].playerDefense}&nbsp
                     스태미나: ${res[i].playerStamina}&nbsp
                     `;
                };

                for (let i in res) {
                    resContext.innerHTML += `
                    <div>${res[i].playerName} <button class="player" onclick="infoPlayer('${i}')" >능력치 조회</button>
                    <button class="player" onclick="excludePlayer('${res[i].playerId}')">편성 제외</button>
                    <br><div id="myPlayer('${[i]}')"></div>
                    <br><br></div>
                    `;
                }
            });
            apiResDiv.appendChild(resContext);
            break;

        // 다른 유저의 편성 조회
        case 'getUserTeamResSendBtn':
            let content = '';
            const param = document.getElementById('reqParams').value;

            getUserTeam(param).then(res => {
                for (let i in res) {
                    content += `
                    +${res[i].enhanceCount} ${res[i].player.playerName}<br><br><br>
                    `;
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
            if (confirm(`rosterId = ${body} 선수를 편성에 추가합니까? `)) {
                updateTeam(body).then(res => {
                    apiResDiv.innerHTML = `${res.data.player.playerName} 선수를 편성에 추가했습니다. `;
                });
            }

            break;
        case 'getPlayersResSendBtn':
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

        // 내 보유 선수 조회
        case 'getMyPlayerResSendBtn':
            getMyPlayer().then(res => {
                window.excludePlayer = async playerId => {
                    //확인창 출력
                    if (confirm('이 선수를 편성에서 제외 하시겠습니까? ')) {
                        excludeTeam(playerId);
                        alert('해당 선수가 편성에서 제외되었습니다. ');

                        // 개선 필요
                        await getMyPlayer().then(res => {
                            resContext.innerHTML = '';
                            for (let i in res.data) {
                                resContext.innerHTML += `
                    ${res.data[i].isPicked === true ? '▼' : ''}
                    선수명 [${res.data[i].playerName}]
                    ${res.data[i].isPicked === true ? `[편성중]` : `보유 수량 : [${res.data[i].playerQuantity}]`}
                    ${res.data[i].isPicked === true ? `<button onclick="excludePlayer('${res.data[i].playerId}')">편성제외</button>` : `<button onclick="addPlayer('${res.data[i].rosterId}')">편성추가</button>`}
                    ${res.data[i].isPicked === true ? '' : `<button onclick="sellPlayer('${res.data[i].rosterId}')">선수 판매</button>`}
                    <button onclick="enhancePlayer('${res.data[i].rosterId}')">선수 강화</button>
                    <br><br>
                    `;
                            }
                        });
                    }
                };

                window.addPlayer = async rosterId => {
                    //확인창 출력
                    if (confirm('이 선수를 편성에 추가합니까? ')) {
                        await updateTeam(rosterId);
                        alert('해당 선수가 편성 되었습니다. ');

                        // 개선 필요
                        await getMyPlayer().then(res => {
                            resContext.innerHTML = '';
                            for (let i in res.data) {
                                resContext.innerHTML += `
                    ${res.data[i].isPicked === true ? '▼' : ''}
                    선수명 [${res.data[i].playerName}]
                    ${res.data[i].isPicked === true ? `[편성중]` : `보유 수량 : [${res.data[i].playerQuantity}]`}
                    ${res.data[i].isPicked === true ? `<button onclick="excludePlayer('${res.data[i].playerId}')">편성제외</button>` : `<button onclick="addPlayer('${res.data[i].rosterId}')">편성추가</button>`}
                    ${res.data[i].isPicked === true ? '' : `<button onclick="sellPlayer('${res.data[i].rosterId}')">선수 판매</button>`}
                    <button onclick="enhancePlayer('${res.data[i].rosterId}')">선수 강화</button>
                    <br><br>
                    `;
                            }
                        });
                    }
                };

                window.sellPlayer = async rosterId => {
                    //확인창 출력
                    if (confirm('이 선수를 판매 하시겠습니까? ')) {
                        await sellMyPlayer(rosterId);
                        alert('해당 선수가 판매되었습니다. +300 Cash ');

                        // 개선 필요
                        await getMyPlayer().then(res => {
                            resContext.innerHTML = '';
                            for (let i in res.data) {
                                resContext.innerHTML += `
                    ${res.data[i].isPicked === true ? '▼' : ''}
                    선수명 [${res.data[i].playerName}]
                    ${res.data[i].isPicked === true ? `[편성중]` : `보유 수량 : [${res.data[i].playerQuantity}]`}
                    ${res.data[i].isPicked === true ? `<button onclick="excludePlayer('${res.data[i].playerId}')">편성제외</button>` : `<button onclick="addPlayer('${res.data[i].rosterId}')">편성추가</button>`}
                    ${res.data[i].isPicked === true ? '' : `<button onclick="sellPlayer('${res.data[i].rosterId}')">선수 판매</button>`}
                    <button onclick="enhancePlayer('${res.data[i].rosterId}')">선수 강화</button>
                    <br><br>
                    `;
                            }
                        });
                    }
                };

                window.enhancePlayer = async rosterId => {
                    //확인창 출력
                    if (confirm('이 선수를 강화 하시겠습니까? ')) {
                        await enhancePlayer(rosterId);

                        // 개선 필요
                        await getMyPlayer().then(res => {
                            resContext.innerHTML = '';
                            for (let i in res.data) {
                                resContext.innerHTML += `
                    ${res.data[i].isPicked === true ? '▼' : ''}
                    선수명 [${res.data[i].playerName}]
                    ${res.data[i].isPicked === true ? `[편성중]` : `보유 수량 : [${res.data[i].playerQuantity}]`}
                    ${res.data[i].isPicked === true ? `<button onclick="excludePlayer('${res.data[i].playerId}')">편성제외</button>` : `<button onclick="addPlayer('${res.data[i].rosterId}')">편성추가</button>`}
                    ${res.data[i].isPicked === true ? '' : `<button onclick="sellPlayer('${res.data[i].rosterId}')">선수 판매</button>`}
                    <button onclick="enhancePlayer('${res.data[i].rosterId}')">선수 강화</button>
                    <br><br>
                    `;
                            }
                        });
                    }
                };

                for (let i in res.data) {
                    resContext.innerHTML += `
                    ${res.data[i].isPicked === true ? '▼' : ''}
                    선수명 [${res.data[i].playerName}]
                    ${res.data[i].isPicked === true ? `[편성중]` : `보유 수량 : [${res.data[i].playerQuantity}]`}
                    ${res.data[i].isPicked === true ? `<button onclick="excludePlayer('${res.data[i].playerId}')">편성제외</button>` : `<button onclick="addPlayer('${res.data[i].rosterId}')">편성추가</button>`}
                    ${res.data[i].isPicked === true ? '' : `<button onclick="sellPlayer('${res.data[i].rosterId}')">선수 판매</button>`}
                    <button onclick="enhancePlayer('${res.data[i].rosterId}')">선수 강화</button>
                    <br><br>
                    `;
                }
                apiResDiv.appendChild(resContext);
            });
            break;

        // 보유 선수 판매
        case 'sellMyPlayerResSendBtn':
            if (confirm(`rosterId = ${body} 선수를 판매합니까? `)) {
                sellMyPlayer(body).then(res => {
                    apiResDiv.innerHTML = res.message;
                });
            }
            break;

        case 'enhancePlayerResSendBtn':
            if (confirm(`rosterId = ${body} 선수를 강화합니까? `)) {
                enhancePlayer(body).then(res => {
                    apiResDiv.innerHTML = res.message;
                });
            }
            break;

        case 'getPlayerDetailResSendBtn':
            getPlayerDetail(params).then(res => {
                const player = res.data;
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

        // 다른 API 요청을 추가로 처리할 수 있음
        default:
            console.log('이 버튼에 해당하는 API 기능이 없습니다');
    }
}
