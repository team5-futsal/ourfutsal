// class Token {
//     #token;

//     constructor(token) {
//         this.#token = token;
//     }

//     get getToken() {
//         return this.#token;
//     }

//     set setToken(newToken) {
//         this.#token = newToken;
//     }
// }

// const token = new Token(123);

// console.log(token.getToken());
// token.setToken(222);
// console.log(token.getToken());
// token.token = 444;
// console.log(token.token);

let token = null;

// 토큰 저장하기
function setAccessToken(newToken) {
    token = newToken;
}

// 토큰 가져오기
function getAccessToken() {
    return token;
}

// 토큰 비우기
function clearToken() {
    token = null;
}
