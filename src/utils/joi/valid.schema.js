import Joi from 'joi'

export default {
    users : Joi.object({
        userId: Joi.string().pattern(new RegExp('^[a-z0-9]{5,15}$')).required(),
        name: Joi.string().pattern(new RegExp('^[\\p{L}\\p{N}]{2,15}$','u')).required(),
        password: Joi.string().min(6).max(40).required()
    }),
    characters : Joi.object({
        name: Joi.string().pattern(new RegExp('^[\\p{L}\\p{N}]{2,15}$','u')).required(),
        health: Joi.number().integer().min(0).max(1000).required(),
        power: Joi.number().integer().min(0).max(1000).required()
    }),
    items : Joi.object({
        name: Joi.string().pattern(new RegExp('^[\\p{L}\\p{N}]{2,15}$','u')).required(),
        stat: Joi.object({
            health: Joi.number().integer().min(0).max(1000),
            power: Joi.number().integer().min(0).max(1000)}).required(),
        price: Joi.number().integer().min(0).max(10000)
    }),
    inventory : Joi.object({
        itemId: Joi.number().integer().min(0).required(),
        count: Joi.number().integer().min(0)
    }),
}
