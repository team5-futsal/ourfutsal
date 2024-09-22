import { prisma } from '../prisma/index.js';

export class UserValidation {
    userId;
    password;

    constructor(body) {
        this.userId = body.userId;
        this.password = body.password;

        this.validationRules = [this.validationUserId, this.validatePassword, this.isExistUser];
    }

    validationUserId = async () => {
        const regex = /^[a-z0-9]+$/;

        if (!regex.exec(this.userId)) {
            return {
                success: false,
                msg: '아이디는 영어 소문자와 숫자만 입력할 수 있습니다.',
            };
        }

        return { success: true };
    };

    validatePassword = async () => {
        if (this.password.length < 6 || this.password.length > 40) {
            return {
                success: false,
                msg: '비밀번호는 6자~40자만 입력할 수 있습니다.',
            };
        }

        return { success: true };
    };

    isExistUser = async () => {
        const isExistUser = await prisma.account.findFirst({
            where: {
                userId: this.userId,
            },
        });

        if (isExistUser) {
            return {
                success: false,
                msg: '이미 존재하는 아이디입니다.',
            };
        }

        return { success: true };
    };

    validation = async () => {
        const results = await Promise.all(this.validationRules.map(rule => rule()));

        for (const result of results) {
            if (!result.success) {
                return {
                    success: false,
                    msg: result.msg,
                };
            }
        }

        if (results.success) {
            return {
                success: true,
                msg: '유효합니다.',
            };
        }
    };
}

export async function getUser(accountId) {
    return await prisma.account.findUnique({
        where: { accountId: accountId },
    });
}