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
        return res.json();
    })
    .then(res => {
        if(res.isCreate) {
            console.log('새로 생성됨');
            return res.newAccessToken;
        }
        if(!res.isCreate) {
            console.log('토큰 유효함');
            return false;
        }
        else {
            throw new Error('새로운 Access Token을 받지 못했습니다.');
        }
    })
    .catch(error => {
        console.error('Access Token 재발급 실패:', error);
        // 재로그인 필요 (Refresh Token도 만료되었을 때)
        window.location.href = '/api';
    });
}