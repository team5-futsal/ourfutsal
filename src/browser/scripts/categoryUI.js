/** API 호출 이후 UI에 관련된 함수 모음입니다.
 * 혹은 UI 관련 로직을 수행합니다.
 */
import { doDisplay, handleApiButtonClick } from './utils.js';
import {
    getAccountAll,
    getAccountInfo,
    updateAccount,
    deleteAccount,
    logoutAccount,
    getTeam,
    excludeTeam,
    excludeTeamAll,
    updateTeam,
    getMyPlayer,
    getPlayerDetail,
    getPlayers,
    sellMyPlayer,
    enhancePlayer,
    searchTeam,
    createPlayer,
    updatePlayerInfo,
    buyGacha,
    runCustomGame,
    matchGame,
} from './api.js';
import { playGame } from './play.js';

// 카테고리 html이 로드되고 js가 로드되었을 때 실행하도록 함.
// 1. 생성된 accessToken을 받아오기 위해 선언함.
window.addEventListener('DOMContentLoaded', () => {
    if (getAccessToken !== null) {
        setAccessToken(localStorage.getItem('accessToken'));
        localStorage.clear();
    }

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
            updateAccount(JSON.parse(body)).then(res => {
                if (res) {
                    alert(`접속한 유저의 비밀번호가 수정되었습니다. 로그인 화면으로 이동합니다.`);
                    window.location.href = 'http://localhost:3333/';
                    window.localStorage.clear();
                } else {
                    alert('500 SERVER ERROR');
                }
            });
            break;

        case 'getAccountResSendBtn':
            getAccountInfo().then(res => {
                for (const [key, value] of Object.entries(res.user)) {
                    resContext.innerHTML += `
                    <p class="users">${key}: ${value}</p>
                    <br>
                    `;
                }
                apiResDiv.appendChild(resContext);
            });
            break;

            sessionStorage.setItem('');
        case 'deleteAccountResSendBtn':
            deleteAccount().then(res => {
                const userId = res.data.userId;
                alert(`접속한 ${userId}가 정상적으로 삭제되었습니다. 로그인 화면으로 이동합니다.`);
                // 삭제가 되었으니 페이지를 기본 홈으로 이동
                window.location.href = 'http://localhost:3333/';
            });
            break;

        case 'logoutAccountResSendBtn':
            logoutAccount().then(res => {
                if (res) {
                    alert('로그아웃 되었습니다. 로그인 화면으로 이동합니다.');
                    window.location.href = 'http://localhost:3333/';
                }
            });
            break;

        // 내 팀 편성 조회
        case 'getTeamResSendBtn':
            const showMyTeam = function (res) {
                console.log(res);
                if (res.message) {
                    resContext.innerHTML = res.message;
                } else {
                    resContext.innerHTML = '';
                    for (let i in res) {
                        resContext.innerHTML += `
                    <div>${res[i].playerName} <button class="player" onclick="infoPlayer('${i}')" >능력치 조회</button>
                    <button class="player" onclick="excludePlayer('${res[i].playerId}')">편성 제외</button>
                    <br><div id="myPlayer('${[i]}')"></div>
                    <br><br></div>
                    `;
                    }

                    window.infoPlayer = async i => {
                        const div = document.getElementById(`myPlayer('${i}')`);
                        div.innerHTML = `
                     파워 : ${res[i].playerStrength}&nbsp 
                     수비력: ${res[i].playerDefense}&nbsp
                     스태미나: ${res[i].playerStamina}&nbsp
                     `;
                    };
                }
            };
            window.excludePlayer = async playerId => {
                if (confirm('이 선수를 편성에서 제외 하시겠습니까? ')) {
                    excludeTeam(playerId);
                    alert('해당 선수가 편성에서 제외되었습니다. ');
                }
                getTeam().then(async res => showMyTeam(res));
            };

            getTeam().then(async res => showMyTeam(res));
            apiResDiv.appendChild(resContext);
            break;

        // 다른 유저의 편성 조회
        case 'getUserTeamResSendBtn':
            searchTeam(params).then(res => {
                if (res.message) {
                    apiResDiv.innerHTML = `${res.message}`;
                } else {
                    for (let i in res) {
                        apiResDiv.innerHTML += `
                    ${res[i].playerName}<br><br><br>
                    `;
                    }
                }
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
            async function myPlayers(res) {
                resContext.innerHTML = '';
                res.data.forEach(player => {
                    resContext.innerHTML += `
                        ${player.isPicked === true ? '▼' : ''}
                        선수명 [${player.playerName}]
                        ${player.isPicked === true ? `[편성중]` : `보유 수량 : [${player.playerQuantity}]`}
                        ${player.isPicked === true ? `<button onclick="excludePlayer('${player.playerId}')">편성제외</button>` : `<button onclick="addPlayer('${player.rosterId}')">편성추가</button>`}
                        ${player.isPicked === true ? '' : `<button onclick="sellPlayer('${player.rosterId}')">선수 판매</button>`}
                        <button onclick="enhancePlayer('${player.rosterId}')">선수 강화</button>
                        <br><br>
                        `;
                });
            }

            window.excludePlayer = async playerId => {
                await excludeTeam(playerId);
                getMyPlayer().then(async res => myPlayers(res));
            };

            window.addPlayer = async rosterId => {
                await updateTeam(rosterId);
                getMyPlayer().then(async res => myPlayers(res));
            };

            window.sellPlayer = async rosterId => {
                if (confirm(' 이 선수를 판매 하시겠습니까? ')) {
                    await sellMyPlayer(rosterId);
                    alert('해당 선수가 판매되었습니다. +300Cash ');
                    getMyPlayer().then(async res => myPlayers(res));
                }
            };

            window.enhancePlayer = async rosterId => {
                if (confirm('이 선수를 강화 하시겠습니까?')) {
                    await enhancePlayer(rosterId);
                    getMyPlayer().then(async res => myPlayers(res));
                }
            };

            getMyPlayer().then(async res => myPlayers(res));
            apiResDiv.appendChild(resContext);
            break;

        // 보유 선수 판매
        case 'sellMyPlayerResSendBtn':
            if (confirm(`rosterId = ${body} 선수를 판매합니까? `)) {
                sellMyPlayer(body).then(res => {
                    apiResDiv.innerHTML = res.message;
                });
            }
            break;
        // 선수 강화
        case 'enhancePlayerResSendBtn':
            if (confirm(`rosterId = ${body} 선수를 강화합니까? `)) {
                enhancePlayer(body).then(res => {
                    apiResDiv.innerHTML = res.message;
                });
            }
            break;


        // 선수 구매 가차
        case 'buyGachaResSendBtn':
            buyGacha(params).then(res => {
                apiResDiv.innerHTML = res.message;
            });

            break;

        case 'enhancePlayerResSendBtn':
            if (confirm(`rosterId = ${body} 선수를 강화합니까? `)) {
                enhancePlayer(body).then(res => {
                    apiResDiv.innerHTML = res.message;
                });
            }
            break;


        // 선수 상세 조회
        case 'getPlayerDetailResSendBtn':
            getPlayerDetail(params).then(res => {
                const player = res.data;
                const playerName = res.data.playerName;
                const positionId = res.data.positionId;
                const playerStrength = res.data.playerStrength;
                const playerDefense = res.data.playerDefense;
                const playerStamina = res.data.playerStamina;
                const apiResDiv = document.querySelector('.apiRes');
                const resContext = document.createElement('div');

                resContext.innerHTML = `
                <p class="users">선수명 : ${playerName} <br> 포지션 아이디 : ${positionId} <br> 공격력 : ${playerStrength} <br> 수비력 : ${playerDefense} <br> 스테미나 : ${playerStamina}</p>
                `;
                apiResDiv.appendChild(resContext);
            });
            break;

        case 'runCustomGameResSendBtn':
            // 매칭 성공 여부 확인하고... 성공했으면 게임에 필요한 데이터를 불러와야한다..
            const matchBody = { accountId: body };
            const runCustomBody = { targetAccountId: body };
            matchGame(matchBody)
                .then(res => {
                    if (res.errorMessage) {
                        resContext.innerHTML += `<p>${res.errorMessage}</p>`;
                        apiResDiv.appendChild(resContext);
                    } else {
                        runCustomGame(runCustomBody).then(async res => {
                            if (res) {
                                doDisplay(false);
                                playGame();
                                // const data = [res.myTeamInfo, res.targetInfo, res.enhanceInfo].map(info => {
                                //     if (typeof info === 'object') {
                                //         return JSON.stringify(info);
                                //     }
                                //     return info;
                                // });

                                // for (let i in data) {
                                //     resContext.innerHTML += `<p>${data[i]}</p>`;
                                // }
                                // apiResDiv.appendChild(resContext);
                            } else if (!res) alert('매칭 데이터를 불러오는 중 실패하였습니다. 매칭을 취소합니다.');
                        });
                    }
                })
            break;

            // 선수 생성
        case  'createPlayerResSendBtn':
            createPlayer(body).then(res => {
                const playerName = res.data.playerName;
                const positionId = res.data.positionId;
                const playerStrength = res.data.playerStrength;
                const playerDefense = res.data.playerDefense;
                const playerStamina = res.data.playerStamina;

                const apiResDiv = document.querySelector('.apiRes');
                const resContext = document.createElement('div');

                resContext.innerHTML = `
                <p class="users">선수명 : ${playerName} <br> 포지션 아이디 : ${positionId} <br> 공격력 : ${playerStrength} <br> 수비력 : ${playerDefense} <br> 스테미나 : ${playerStamina}</p>
                `;
                apiResDiv.appendChild(resContext);
            });
            break;
            
            // 선수 상세 정보 수정
            case 'updatePlayerInfoResSendBtn':
                updatePlayerInfo(params, body).then(res => {
                    apiResDiv.innerHTML = res.message;
                    apiResDiv.appendChild(resContext);
                })

        // 다른 API 요청을 추가로 처리할 수 있음
        default:
            console.log('이 버튼에 해당하는 API 기능이 없습니다');
    }
}
