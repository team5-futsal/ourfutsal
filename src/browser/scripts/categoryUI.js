/** API 호출 이후 UI에 관련된 함수 모음입니다.
 * 혹은 UI 관련 로직을 수행합니다.
 */
import { handleApiButtonClick } from './utils.js';
// import { getAccounts } from './api.js';

// 카테고리에 있는 각 API 버튼에 이벤트 리스너 추가
document.querySelectorAll('[type="apiForm"] button').forEach(button => {
    button.addEventListener('click', handleApiButtonClick);
});

// document.getElementById('getAccountsResSendBtn').addEventListener('click', function (event){
//     event.preventDefault();

//     getAccounts().then(res => {
//         console.log(res.data);
//     });
// })

