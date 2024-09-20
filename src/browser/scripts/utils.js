/** 공통으로 작동하는 기능입니다. */

import { getAccounts, getTeam, excludeTeam, getUserTeam, updateTeam, excludeTeamAll } from './api.js';

/** api 버튼을 누르면 Request 창이 토글형식으로 작동하도록 하는 함수 */
export function handleApiButtonClick(event) {
    event.preventDefault(); // 기본 동작 방지

    const apiRequestDiv = document.querySelector('.apiRequestBtn');

export function handleApiButtonClick(event) {
    event.preventDefault(); // 기본 동작 방지
    const apiRequestDiv = document.querySelector('.apiRequestBtn');

    // apiRequest 클래스 하단에 버튼이 있는지 확인한다.
    // 버튼이 있다면 삭제
    if (apiRequestDiv.children[0]) {
        apiRequestDiv.removeChild(apiRequestDiv.children[0]);
    }

    // 버튼이 없다면 ${clickedButtonName} 이름의 버튼 생성
    // 여기서 새로 생성된 버튼에 동작을 주려면 새로운 변수에 담지 않고, 
    // createElement를 담은 변수에 addEventListener를 넣어줘야 동작함.
    const sendRequestBtn = document.createElement('button');
    sendRequestBtn.id = event.target.id+'ResSendBtn';
    sendRequestBtn.textContent = 'Send Request';
    sendRequestBtn.type = 'apiButton';
    apiRequestDiv.appendChild(sendRequestBtn);
}
  
    if (sendRequestBtn) {
        sendRequestBtn.addEventListener('click', event => {
            event.preventDefault();
            // 그럼 여기서 어떻게 동작을 줄 것인지 정의가 필요함.
            // switch 문으로 API 마다 전달할 param과 body를 구분하고, fetch 기능을 정의할 예정..
            const params = document.getElementById('reqParams').value;
            const body = document.getElementById('reqBody').value;

            // switch api
            if (sendRequestBtn.id === 'getAccountsResSendBtn') {
                getAccounts().then(res => {
                    const apiResDiv = document.querySelector('.apiRes');
                    const resContext = document.createElement('p');
                    resContext.textContent = JSON.stringify(res.data);
                    apiResDiv.appendChild(resContext);
                });
            }

            // 내 팀 편성 조회
            if (sendRequestBtn.id === 'getTeamResSendBtn') {
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
            }

            // 다른 유저의 편성 조회
            if (sendRequestBtn.id === 'getUserTeamResSendBtn') {
                let content = '';
                const param = document.getElementById('reqParams').value;
                const apiResDiv = document.querySelector('.apiRes');
                getUserTeam(param).then(res => {
                    for (let i in res) {
                        content += `<div>${res[i].playerName}</div><br><br><br>`;
                    }

                    apiResDiv.innerHTML = content;
                });
            }

            // 내 팀 편성 제외
            if (sendRequestBtn.id === 'excludeTeamResSendBtn') {
                const body = document.getElementById('reqBody').value;
                const apiResDiv = document.querySelector('.apiRes');
                if (confirm(`playerId = ${body} 선수를 편성에서 제외 하시겠습니까? `)) {
                    excludeTeam(body).then(res => {
                        apiResDiv.textContent = res.message;
                    });
                }
            }

            // 내 팀 편성 모두 제외
            if (sendRequestBtn.id === 'excludeTeamAllResSendBtn') {
                const apiResDiv = document.querySelector('.apiRes');
                if (confirm(`모든 선수를 편성에서 제외 하시겠습니까? `)) {
                    excludeTeamAll().then(res => {
                        apiResDiv.textContent = res.message;
                    });
                }
            }

            // 내 팀 편성 추가
            if (sendRequestBtn.id === 'updateTeamResSendBtn') {
                const body = document.getElementById('reqBody').value;
                const apiResDiv = document.querySelector('.apiRes');
                if (confirm(`playerId = ${body} 선수를 편성에 추가합니까? `)) {
                    updateTeam(body).then(res => {
                        apiResDiv.textContent = res.message;
                    });
                }
            }
        });
    }
}
