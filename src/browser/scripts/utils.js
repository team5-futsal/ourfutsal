/** 공통으로 작동하는 기능입니다. */

import { getAccounts } from "./api.js";

/** api 버튼을 누르면 Request 창이 토글형식으로 작동하도록 하는 함수 */
export function handleApiButtonClick(event) {
    event.preventDefault(); // 기본 동작 방지
    const apiRequestDiv = document.querySelector('.apiRequestBtn');

    // const btnId = event.target.id;
    // switch(btnId) {
    //     case 'getAccounts':
    //         {

    //         }
    // }

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

    if(sendRequestBtn) {
        sendRequestBtn.addEventListener('click', (event) => {
            event.preventDefault();
            // 그럼 여기서 어떻게 동작을 줄 것인지 정의가 필요함.
            // switch 문으로 API 마다 전달할 param과 body를 구분하고, fetch 기능을 정의할 예정..
            const params = document.getElementById('reqParams').value;
            const body = document.getElementById('reqBody').value;

            // switch api
            if(sendRequestBtn.id === 'getAccountsResSendBtn') {
                getAccounts().then(res => {
                    const apiResDiv = document.querySelector('.apiRes');
                    const resContext = document.createElement('p');
                    resContext.textContent = JSON.stringify(res.data);
                    apiResDiv.appendChild(resContext);
                });
            }
        })
    }


}
