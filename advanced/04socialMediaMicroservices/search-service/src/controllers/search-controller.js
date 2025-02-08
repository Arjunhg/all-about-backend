const Search = require("../models/Search");
const logger = require("../utils/logger")


const searchPostController = async(req, res) => {

    logger.info(`Searching endoint hit`);

    try {
        
        const { query } = req.query;

        const results = await Search.find({
                $text: {
                    $search: query
                }
            },{
                score: { $meta: 'textScore' }
            }
        ).sort({ score: { $meta: 'textScore' }}).limit(10);

        return res.json(results);
    } catch (error) {
        logger.error(`Error in searchPostController: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Error while searching post"
        })
    }
}

module.exports = { searchPostController };