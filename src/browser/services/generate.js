export async function refreshAccessToken(accessToken) {
    return fetch('/api/refreshToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization' : accessToken,
        },
        credentials: 'include' // 쿠키에 있는 Refresh Token 포함
    })
    .then(res => {
        if(res.status === 401) {
            throw new Error('리프레시 토큰이 만료되었거나 없습니다.');
        }
        return res.json();
    })
    .then(res => {
        if(res.errorMessage) {
            throw new Error(res.errorMessage);
        }
        if(res.isCreate) {
            console.log('토큰 유효하지 않음.')
            console.log('새로 생성됨');
            return res.newAccessToken;
        }
        if(!res.isCreate) {
            console.log('토큰 유효함');
            return false;
        }
    })
    .catch(error => {
        alert(error);
        alert('Access Token 재발급 실패, 다시 로그인해주세요')
        // 재로그인 필요 (Refresh Token도 만료되었을 때)
        window.location.href = '/';
    })
}