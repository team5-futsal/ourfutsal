import { prisma } from '../utils/prisma/index.js';
import validSchema from './joi/valid.schema.js';

export class UserValidation {
    userId;
    password;

    constructor(body) {
        this.userId = body.userId;
        this.password = body.password;

        this.validationRules = [
            this.validationUserId,
            this.validatePassword,
            this.isExistUser,
        ]
    }

    validationUserId = async () => {
        try {
            const validationId = await validSchema.account.validateAsync(this.userId);
        }
        catch(e) {
            return {
                success: false,
                msg: '아이디는 영어 소문자와 숫자만 입력할 수 있습니다.'
            }
        }
    }

    validatePassword = async () => {
        try {
            const validationPassword = await validSchema.account.validateAsync(this.password);
        
        }
        catch(e) {
            return {
                success: false,
                msg: '비밀번호는 6자~40자만 입력할 수 있습니다.'
            }
        }
    }

    isExistUser = async () => {
        try{
            const isExistUser = await prisma.account.findFirst({
                where: {
                    userId:this.userId,
                },
            });
        }
        catch(e) {
            console.log(e);
            return {
                success: false,
                msg: '이미 존재하는 아이디입니다.'
            }
        }
    }

    validation = async () => {
        try {
            this.validationRules.forEach((rule) => rule());
            
            return {
                success: true,
                msg: '유효합니다.'
            }
        } catch (e) {
            if (e instanceof ValidationError) {
                return {
                    success: false,
                    msg: e.message
                }
            }
            else {
                return {
                    success: false,
                    msg: '서버 에러'
                }
            }
        }

        
    }
}