const joi = require('joi');

const validateCreatePost = (data) => {

    const schema = joi.object({

        content: joi.string().min(3).max(5000).required(),
    })

    return schema.validate(data);
}


module.exports = {validateCreatePost};


/*
If everything is valid, Joi returns { value: data } (no error).
If validation fails, Joi returns { error: details }.
*/